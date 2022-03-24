/* eslint-disable max-len */
'use strict';

const assert = require('chai').assert;
const controller = require('../controller.js');
const nock = require('nock');
const sinon = require('sinon');

const TEST_PARAGRAPH = 'test paragraph content';

describe('controller', () => {
  // Make new Date() return a fixed date
  sinon.useFakeTimers(new Date('2022-01-19').getTime());

  describe('#getContext()', () => {
    describe('#getContext() with defaults', () => {
      const testContext = controller._getContext({
        originalUrl: '/test/path',
        query: {},
      });
      it('should default format to word', () => assert.equal(testContext.format, 'word'));
      it('should default numberOfPositions to 5', () => assert.equal(testContext.numberOfPositions, 5));
      it('should set url', () => assert.equal(testContext.url, '/test/path'));
      it('should set start time', () => assert.exists(testContext.startTime));
    });

    describe('#getContext() using querystring params', () => {
      const textContext = controller._getContext({
        originalUrl: '/test-url',
        query: {
          f: 'json',
          n: '20',
        },
        headers: {
        },
        auth: {},
      });
      it('should use querystring f for format', () => assert.equal(textContext.format, 'json'));
      it('should use querystring n for numberOfPositions to querystring f', () => assert.equal(textContext.numberOfPositions, 20));
    });
  });

  describe('#handleCandidateRequest()', () => {

    describe('with non-guid candidate id', () => {
      const mockReq = createMockRequest();
      mockReq.params.candidateId = 'bad-candidate-id';
      const mockRes = createMockResponse();
      controller.handleCandidateRequest(mockReq, mockRes);

      it('should have status code 400', () => assert.equal(mockRes.status, 400));
      it('should have application/json content type', () => assert.deepEqual(mockRes.headers, {'Content-Type': 'application/json; charset=utf-8'}));

      const body = JSON.parse(mockRes.body);
      it('should have body error type set to error', () => assert.equal(body.type, 'error'));
      it('should have body error message set to bad request', () => assert.equal(body.message, 'Bad request: bad-candidate-id is not a valid id'));
      it('should have body error status set to 400', () => assert.equal(body.status, 400));
      it('should have body error date field', () => assert.exists(body.date));
    });

    describe('candidate that exists (0e6b06f7-b56c-4507-8da1-9567a7bf6d24) using network mock', () => {
      it('should return 200 with JSON content type and expected body', () => {
        return testHandleCandidateRequestMethodWithNetworkMock('0e6b06f7-b56c-4507-8da1-9567a7bf6d24', undefined, undefined, (res) => {
          const body = JSON.parse(res.body);
          assert.equal(body.candidateId, '0e6b06f7-b56c-4507-8da1-9567a7bf6d24', 'Expected candidateId');
          assert.equal(body.initials, 'FN', 'Expected initials');
          assert.equal(body.jobTitle, 'Creative Director (Copy) - Advertising', 'Expected jobTitle');
          assert.equal(body.ref, 'https://smartrecruiters.com/app/people/candidates/0e6b06f7-b56c-4507-8da1-9567a7bf6d24', 'Expected ref');
          assert.equal(body.tags.length, 0, 'Expected number of tags');
          assert.equal(body.positions.length, 5, 'Expected number of postions');
          assert.equal(body.positions[0].title, 'Creative Director, Wayne Enterprises', 'Expected most recent position title');
          assert.equal(body.positions[4].duration, '3 years, 5 months', 'Expected earliest position duration');
          assert.equal(body.positions[4].text, 'Director/Producer/Writer of various TV ads and marketing films for companies like Genco Pura Olive Oil Company, The New York Inquirer & Duff Beer', 'Expected earliest position text');
        });
      });
    });

    describe('candidate that exists (2c6d9a95-fb16-4e97-a7b4-9a797222ef3a) using network mock', () => {
      it('should return 200 with JSON content type and expected body', () => {
        return testHandleCandidateRequestMethodWithNetworkMock('2c6d9a95-fb16-4e97-a7b4-9a797222ef3a');
      });
    });

    describe('candidate that doesnt exist - 401 with permission denied error (2135e71e-43b9-4d40-ae1e-113180b72863) using network mock', () => {
      it('should return 404 with JSON content type and expected error message body', () => {
        return testHandleCandidateRequestMethodWithNetworkMock('2135e71e-43b9-4d40-ae1e-113180b72863', [401], 404);
      });
    });

    describe('invalid api token - 401 (0f6ba9c1-9206-431b-b504-776583bdd07c) using network mock', () => {
      it('should return 500 with JSON content type and expected error message body', () => {
        return testHandleCandidateRequestMethodWithNetworkMock('0f6ba9c1-9206-431b-b504-776583bdd07c', [401], 500);
      });
    });

    describe('Smart Recruiters API rate limit exceeded - 429 (61238e47-f1f1-4e32-8097-4dab33b413cf) using network mock', () => {
      it('should pass through the 429 with JSON content type and expected error message body', () => {
        return testHandleCandidateRequestMethodWithNetworkMock('61238e47-f1f1-4e32-8097-4dab33b413cf', [429], 429, (res) => {
          const body = JSON.parse(res.body);
          assert.equal(body.type, 'warning');
          assert.equal(body.message, 'The Smart Recruiters API rate limit has been exceeded. Please try again in a few seconds.');
        });
      });
    });

    describe('Smart Recruiters API unavailable - 503 (0d358a21-64e8-4393-8fee-a71e72fe5683) using network mock', () => {
      it('should pass through the 503 with JSON content type and expected error message body', () => {
        return testHandleCandidateRequestMethodWithNetworkMock('0d358a21-64e8-4393-8fee-a71e72fe5683', [503], 503, (res) => {
          const body = JSON.parse(res.body);
          assert.equal(body.type, 'error');
          assert.equal(body.message, 'Smart Recruiters API is currently unavailable. Please try again later');
        });
      });
    });

    describe('candidate that exists (0e6b06f7-b56c-4507-8da1-9567a7bf6d24) using network mock but error thrown during tranformation or render', () => {
      it('should return 500 with JSON content type and expected error message body', () => {
        const candidateId = '0e6b06f7-b56c-4507-8da1-9567a7bf6d24';
        networkMockCandidateHttpApiCalls(candidateId, null, [200, 200, 200]);
        const mockReq = createMockRequest();
        mockReq.params.candidateId = candidateId;
        const mockRes = createMockResponse();

        // Tweak write head method so throws error for initial call
        mockRes.writeHead = function(status, headers) {
          if (status === 200) {
            throw new Error('Whoops! Something bad happened during the transformation or render');
          } else {
            this.status = status;
            this.headers = headers;
          }
        };

        return controller.handleCandidateRequest(mockReq, mockRes).then(() => {
          assert.equal(mockRes.status, 500);
          assert.deepEqual(mockRes.headers, {'Content-Type': 'application/json; charset=utf-8'});
          assert.deepEqual(deleteDate(JSON.parse(mockRes.body)), {
            type: 'error',
            message: 'Sorry, an error occurred! Please report it to abc@digitas.com and include the full output of this page',
            status: 500,
            error: {
              message: 'Error: Whoops! Something bad happened during the transformation or render',
              reason: 'server',
            },
          });
        });
      });
    });

    describe('word for candidate that exists (2c6d9a95-fb16-4e97-a7b4-9a797222ef3a) using network mock', () => {
      it('should return 200 with Content-disposition header that includes filename', () => {
        const candidateId = '2c6d9a95-fb16-4e97-a7b4-9a797222ef3a';
        networkMockCandidateHttpApiCalls(candidateId, null, [200, 200, 200]);
        const mockReq = createMockRequest('word');
        mockReq.params.candidateId = candidateId;
        const mockRes = createMockResponse();
        return controller.handleCandidateRequest(mockReq, mockRes).then(() => {
          assert.equal(mockRes.status, 200);
          assert.deepEqual(mockRes.headers, {'Content-disposition': 'attachment; filename=Anonymised Candidate Profile - JB - Full Stack Web Developer - PS82681.docx'});
          // Can't really test Word binary format
          assert.exists(mockRes.buffer, 'buffer not set');
        });
      });
    });
  });

  describe('#isUUID', () => {
    it('should return true for a guid', () => assert.isTrue(controller._isUUID('99c38480-38af-4d81-b0fb-c1a1b2330bce')));
    it('should return false for null', () => assert.isFalse(controller._isUUID(null)));
    it('should return false for empty string', () => assert.isFalse(controller._isUUID('')));
    it('should return false for a non-guid', () => assert.isFalse(controller._isUUID('1234')));
    it('should return false for a number', () => assert.isFalse(controller._isUUID(9)));
  });


  describe('#addContentArrayForCandidate', () => {

    it('should do nothing for candidate with no positions', () => {
      const testCandidate = {
        positions: [],
      };
      controller._addContentArrayForCandidate(testCandidate);
      assert.deepEqual(testCandidate, {
        positions: [],
      });
    });

    it('should add empty content array for a position with no text', () => {
      const testCandidate = {
        positions: [
          { text: '' },
        ],
      };
      controller._addContentArrayForCandidate(testCandidate);
      assert.exists(testCandidate.positions[0].content);
      assert.equal(testCandidate.positions[0].content.length, 0);
    });

    it('should add content array with paragraph for each position with text (with no formatting)', () => {
      const testCandidate = {
        positions: [
          { text: TEST_PARAGRAPH },
          { text: TEST_PARAGRAPH },
        ],
      };
      controller._addContentArrayForCandidate(testCandidate);
      assert.exists(testCandidate.positions[0].content);
      assert.equal(testCandidate.positions[0].content.length, 1);
      assert.deepEqual(testCandidate.positions[0].content[0], { paragraph: TEST_PARAGRAPH });
      assert.exists(testCandidate.positions[1].content);
      assert.equal(testCandidate.positions[1].content.length, 1);
      assert.deepEqual(testCandidate.positions[1].content[0], { paragraph: TEST_PARAGRAPH });
    });

    it('should add content array with multiple paragraphs for each position with text containing newlines)', () => {
      const testCandidate = {
        positions: [
          { text: `${TEST_PARAGRAPH}\n${TEST_PARAGRAPH}` },
        ],
      };
      controller._addContentArrayForCandidate(testCandidate);
      assert.exists(testCandidate.positions[0].content);
      assert.equal(testCandidate.positions[0].content.length, 2);
      assert.deepEqual(testCandidate.positions[0].content, [{ paragraph: TEST_PARAGRAPH }, { paragraph: TEST_PARAGRAPH } ]);
    });
  });
});

function testHandleCandidateRequestMethodWithNetworkMock(candidateId, statusCodes = [200, 200, 200], expectedStatus = 200, additionalAssertions) {
  const expectedBody = require(`./data/candidate/${candidateId}/expected.json`);
  networkMockCandidateHttpApiCalls(candidateId, null, statusCodes);
  const mockReq = createMockRequest();
  mockReq.params.candidateId = candidateId;
  const mockRes = createMockResponse();
  return controller.handleCandidateRequest(mockReq, mockRes).then(() => {
    assert.equal(mockRes.status, expectedStatus);
    assert.deepEqual(mockRes.headers, {'Content-Type': 'application/json; charset=utf-8'});
    console.log(mockRes.body);
    assert.deepEqual(deleteDate(JSON.parse(mockRes.body)), expectedBody);
    if (additionalAssertions){
      additionalAssertions(mockRes);
    }
  });
}

function networkMockCandidateHttpApiCalls(candidateId, jobId, statusCodes) {
  const scope = nock('https://api.smartrecruiters.com');
  const candidate = require(`./data/candidate/${candidateId}/candidate.json`);
  scope.get(`/candidates/${candidateId}`).reply(statusCodes[0], candidate);
  if (statusCodes[0] === 200){
    if (!jobId) {
      jobId = candidate.primaryAssignment.job.id;
      scope.get(`/candidates/${candidateId}/jobs/${jobId}/screening-answers`).reply(statusCodes[1], require(`./data/candidate/${candidateId}/screening-answers.json`));
      scope.get(`/jobs/${jobId}`).reply(statusCodes[2], require(`./data/candidate/${candidateId}/job.json`));
    }
  }
}

function createMockRequest(format = 'json') {
  return {
    params: {},
    query: {
      f: format,
    },
    headers: {},
    auth: {},
  };
}

function createMockResponse() {
  return {
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body){
      this.body = body;
    },
    render(template, model) {
      this.template = template;
      this.model = model;
      this.status = 200;
      this.headers = {'Content-Type': 'text/html; charset=utf-8'};
    },
    setHeader(name, value){
      this.status = 200;
      this.headers = {};
      this.headers[name] = value;
    },
    send(buffer){
      this.buffer = buffer;
    },
  };
}

function deleteDate(o){
  if (o.date){
    delete o.date;
  }
  return o;
}
