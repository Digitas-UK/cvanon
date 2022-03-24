/* eslint-disable max-len */
'use strict';

// 29 job title substitutions provided by talent team on 16/11  e.g. Foreman > "Supervisor"
// Originally adapted and abridged from https://github.com/xenoash/coen691-gender-neutralizer/blob/master/proj/dictionary.txt
const JOB_TITLE_SUBSTITUTIONS = require('./job-title-substitutions.json');

function buildCandidate(src, context) {
  const positions = [];
  if (src.experience) {
    src.experience
      .sort(experienceSorter)
      .slice(0, context.numberOfPositions)
      .forEach(e => positions.push({
        title: getTitle(e, src.id),
        duration: calculateDuration(e),
        text: neutralise(e.description, src.firstName, src.id),
      }));
  }
  return {
    jobTitle: src.primaryAssignment.job.title,
    initials: src.firstName.charAt(0) + src.lastName.charAt(0),
    candidateId: src.id,
    ref: 'https://smartrecruiters.com/app/people/candidates/' + src.id,
    tags: src.tags ? src.tags : [],
    hasTags: !!(src.tags && src.tags.length > 0),
    positions: positions,
  };
}

function buildNotes(src, firstName, config) {
  return getRadioValue(src, 'Employment Visa Status');
}

function buildFileName(candidate) {
  return `Anonymised Candidate Profile - ${candidate.initials} - ${cleanString(candidate.jobTitle)} - ${candidate.jobRef}.docx`;
}

function experienceSorter(a, b) {
  if (a.endDate && b.endDate) {
    return b.endDate.localeCompare(a.endDate);
  }
  if (a.current && !b.current) {
    return -1;
  }
  if (!a.current && b.current) {
    return 1;
  }
  if (a.startDate && b.startDate) {
    return b.startDate.localeCompare(a.startDate);
  }
  return 0;
}

function getTitle(experience, candidateId) {
  const hasJobTitle = !!(experience.title) && experience.title.length > 0;
  const hasCompany = !!(experience.company) && experience.company.length > 0;
  return (hasJobTitle ? neutraliseJobTitle(experience.title, candidateId) : '') +
         (hasJobTitle && hasCompany ? ', ' : '') +
         (hasCompany ? experience.company : '');
}

function neutraliseJobTitle(title, candidateId) {
  let modifiedTitle = title;
  JOB_TITLE_SUBSTITUTIONS.forEach(j => {
    modifiedTitle = modifiedTitle.replace(new RegExp('\\b' + j.from + '\\b', 'ig'), j.to);
  });
  if (modifiedTitle !== title){
    console.log(`NEUTRALISE (job title, candidateId=${candidateId}): ${title} => ${modifiedTitle}`);
  }
  return modifiedTitle;
}

function calculateDuration(experience) {
  if (experience.startDate && (experience.current || experience.endDate)) {
    const from = new Date(experience.startDate);
    const to = experience.current ? new Date() : new Date(experience.endDate);
    const monthDiff = to.getMonth() - from.getMonth() + (12 * (to.getFullYear() - from.getFullYear())) + 1;
    const years = Math.floor(monthDiff / 12);
    const months = monthDiff % 12;
    let duration = (years === 0 ? '' : years + ' year') + (years > 1 ? 's' : '');
    duration += (years !== 0 && months !== 0 ? ', ' : '');
    duration += (months === 0 ? '' : months + ' month') + (months > 1 ? 's' : '');
    return duration;
  }
}

function neutralise(text, firstName, candidateId) {
  if (!text) return '';
  let modified = replaceFirstNameWithTheCandidate(text, firstName);
  modified = genderNeutralise(modified);
  if (text !== modified){
    // Log the first change...
    const pos = findFirstDiffPos(text, modified);
    const originalSample = text.substr(pos, 16);
    const modifiedSample = modified.substr(pos, 16);
    console.log(`NEUTRALISE (text, candidateId=${candidateId}): ${originalSample} => ${modifiedSample}`);
  }
  return modified;
}

function replaceFirstNameWithTheCandidate(text, firstName) {
  text = text.replace(new RegExp('^(' + firstName + ')\\b', 'ig'), 'The candidate');
  text = text.replace(new RegExp('\\. (' + firstName + ')\\b', 'ig'), '. The candidate');
  text = text.replace(new RegExp('\\b(' + firstName + ')\\b', 'ig'), 'the candidate');
  return text;
}

function genderNeutralise(text) {
  // Rules adapted from https://github.com/alexhanna/geneutext/blob/master/index.php but I've separated out upper and lowecase)

  // Uppercase
  text = text.replace(/\b((S){0,1}[Hh]e is)\b/g, 'They are');
  text = text.replace(/\b((S){0,1}[Hh]e\'s)/g, "They're");
  text = text.replace(/\b((S){0,1}[Hh]e was)\b/g, 'They were');
  text = text.replace(/\b((S){0,1}[Hh]e has)\b/g, 'They have');
  text = text.replace(/\b((S){0,1}[Hh]e)\b/g, 'They');
  text = text.replace(/\b(Her)(\s+and|\s+or)\b/g, 'Them');
  text = text.replace(/\b(Her)\./g, 'Them.');
  text = text.replace(/\b(Her),/g, 'Them,');
  text = text.replace(/\b(Her)$/g, 'Them');
  text = text.replace(/\b(Him)\b/g, 'Them');
  text = text.replace(/\b(Hers)\b/g, 'Theirs');
  text = text.replace(/\b(His|Her)\b/g, 'Their');
  text = text.replace(/\b(Himself|Herself)\b/g, 'Themself');

  // Lowercase
  text = text.replace(/\b((s){0,1}he is)\b/g, 'they are');
  text = text.replace(/\b((s){0,1}he\'s)/g, "they're");
  text = text.replace(/\b((s){0,1}he was)\b/g, 'they were');
  text = text.replace(/\b((s){0,1}he has)\b/g, 'they have');
  text = text.replace(/\b((s){0,1}he)\b/g, 'they');
  text = text.replace(/\b(her)(\s+and|\s+or)\b/g, 'them');
  text = text.replace(/\b(her)\./g, 'them.');
  text = text.replace(/\b(her),/g, 'them,');
  text = text.replace(/\b(her)$/g, 'them');
  text = text.replace(/\b(him)\b/g, 'them');
  text = text.replace(/\b(hers)\b/g, 'theirs');
  text = text.replace(/\b(his|her)\b/g, 'their');
  text = text.replace(/\b(himself|herself)\b/g, 'themself');
  return text;
}

function findFirstDiffPos(a, b) {
  let i = 0;
  if (a === b) return -1;
  while (a[i] === b[i]) i++;
  return i;
}

function getRadioValue(src, name) {
  const item = src.content.filter(c => c.name === name)[0];
  return (item) ? `${item.label} ${item.records.map(r => r.fields[0].values[0].label)[0]}` : '';
}

function cleanString(s) {
  return s ? s.replace(/[^\w]/g, ' ').replace(/ +/g, ' ') : '';
}

module.exports = {
  buildCandidate,
  buildNotes,
  buildFileName,
  _getTitle: getTitle,
  _calculateDuration: calculateDuration,
  _genderNeutralise: genderNeutralise,
};
