/* eslint-disable max-len */
'use strict';

const { performance } = require('perf_hooks');

const smartRecruitersApiWrapper = require('./smartRecruitersApiWrapper');
const adaptor = require('./adaptor');
const htmlHelper = require('./htmlHelper');
const wordTemplater = require('./wordTemplater');
const config = require('./config');

const DEFAULT_FORMAT = 'word';
const DEFAULT_NUMBER_OF_POSITIONS = '5';
const DEFAULT_EXPERIMENTAL_FEATURES = 'true';

async function handleCandidateRequest(req, res) {
  const context = getContext(req);
  logStart(context);

  const candidateId = req.params.candidateId;
  if (!isUUID(candidateId)) {
    setErrorResponse(res, {status: 400, message: `Bad request: ${candidateId} is not a valid id`, reason: 'server'}, context);
    return;
  }

  const jobId = req.query.jobId;
  if (jobId && !isUUID(jobId)) {
    setErrorResponse(res, {status: 400, message: `Bad request: ${jobId} is not a valid id`, reason: 'server'}, context);
    return;
  }

  try {
    const candidate = await getCandidate(candidateId, jobId, res, context);
    setCandidateResponse(res, candidate, context);
  } catch (err) {
    setErrorResponse(res, err, context);
  }
}

async function getCandidate(candidateId, jobId, res, context) {
  const srcCandidate = await smartRecruitersApiWrapper.get(`/candidates/${candidateId}`);
  const candidate = adaptor.candidate(srcCandidate, context);
  if (!jobId) {
    jobId = srcCandidate.primaryAssignment.job.id;
  }
  const srcNotes = await smartRecruitersApiWrapper.get(`/candidates/${candidateId}/jobs/${jobId}/screening-answers`);
  candidate.notes = adaptor.notes(srcNotes, srcCandidate.firstName, context);
  const job = await smartRecruitersApiWrapper.get(`/jobs/${jobId}`);
  candidate.jobRef = job.refNumber;
  return candidate;
}

function getContext(req) {
  const {
    f: format = DEFAULT_FORMAT,
    n: numberOfPositions = DEFAULT_NUMBER_OF_POSITIONS,
    e: experimentalFeatures = DEFAULT_EXPERIMENTAL_FEATURES } = req.query;
  return {
    format: format,
    numberOfPositions: Number(numberOfPositions),
    experimentalFeatures: experimentalFeatures === 'true',
    url: req.originalUrl,
    startTime: performance.now(),
  };
}

function setJsonResponse(res, payload) {
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(payload));
}

function setCandidateResponse(res, candidate, context) {
  try {
    if (context.format === 'word') {
      addContentArrayForCandidate(candidate, context);
      wordTemplater.render(res, 'candidate.docx', candidate, getCandidateFilename(candidate));
    } else {
      setJsonResponse(res, candidate);
    }
    logFinish(context, 200);
  } catch (err) {
    setErrorResponse(res, err, context);
  }
}

function getCandidateFilename(candidate) {
  return `Anonymised Candidate Profile - ${candidate.initials} - ${cleanJobTitle(candidate.jobTitle)} - ${candidate.jobRef}.docx`;
}

function cleanJobTitle(jobTitle) {
  return jobTitle ? jobTitle.replace(/[^\w]/g, ' ').replace(/ +/g, ' ') : '';
}

function setErrorResponse(res, error, context) {
  const errorResponse = {
    type: 'error',
    message: `Sorry, an error occurred! Please report it to ${config.getSupportEmailAddress()} and include the full output of this page`,
    status: 500,
    date: (new Date()).toString(),
    url: context.url,
  };

  if (error && error instanceof Error) {
    console.log(error);
    errorResponse.error = {
      message: error.toString(),
      reason: 'server',
    };
  } else {
    // Pass through 400s raised by checking for bad guids
    if (error.status === 400 && error.reason === 'server') {
      errorResponse.message = error.message;
      errorResponse.status = error.status;
    }

    // API returms 401 for GUIDs that do not exist - map to a 404... (but also 401 for no api key and invalid key so leave those)
    if (error.status === 401 && error.message === 'Not permitted to see this candidate') {
      errorResponse.message = 'The Smart Recruiters candidate or job was not found.';
      errorResponse.status = 404;
    }

    // Pass through API rate limit exceeded
    if (error.status === 429) {
      errorResponse.type = 'warning';
      errorResponse.message = 'The Smart Recruiters API rate limit has been exceeded. Please try again in a few seconds.';
      errorResponse.status = error.status;
    }

    // Pass through API service unavailable
    if (error.status === 503){
      errorResponse.message = 'Smart Recruiters API is currently unavailable. Please try again later';
      errorResponse.status = error.status;
    }

    // Add the error
    if (errorResponse.status !== 400 && errorResponse.status !== 404) {
      errorResponse.error = error;
    }
  }

  res.writeHead(errorResponse.status, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(errorResponse));

  logFinish(context, errorResponse.status, getLogErrorMessage(error));
}

function getLogErrorMessage(error) {
  return (error instanceof Error) ? error.toString() : error.message;
}

function isUUID(guid) {
  return !!guid && String(guid).match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$') !== null;
}

function addContentArrayForCandidate(candidate, context) {
  candidate.positions.forEach(p => {
    p.content = htmlToContentArray(fixHtml(p.text, context));
  });
}

function htmlToContentArray(html) {
  const content = [];
  html.split(/<p>|<ul>/).forEach(p => {
    if (p) {
      if (p.startsWith('<li>')) {
        content.push({
          bullets: p
            .replace(/<\/ul>/, '')
            .split(/<li>/)
            .filter(li => li)
            .map(li => li.replace(/<\/li>/, '')),
        });
      } else {
        content.push({
          paragraph: p.replace(/<\/p>/, ''),
        });
      }
    }
  });
  return content;
}

function fixHtml(s, context) {
  if (context.experimentalFeatures) {
    return htmlHelper.fixBulletsAndParagraphs(s);
  }
  // Original version for newlines and asterix-based bullets that have no new line chars
  return (s) ? s.replace(/\n/g, '<br/>').replace(/\*/g, '<br/>*') : '';
}

function logStart(context) {
  console.log(`SERVER: ${context.url} <<`);
}

function logFinish(context, status, message = null) {
  const formattedMessage = (message) ? ` [${message}]` : '';
  console.log(`SERVER: ${context.url} >> ${status}${formattedMessage} (${(performance.now() - context.startTime).toFixed(2)} ms)`);
}

module.exports = {
  handleCandidateRequest,
  _getContext: getContext,
  _getCandidateFilename: getCandidateFilename,
  _isUUID: isUUID,
};
