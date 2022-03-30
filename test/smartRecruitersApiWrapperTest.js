/* eslint-disable max-len */
'use strict';

const assert = require('chai').assert;
const nock = require('nock');
const smartRecruitersApiWrapper = require('../smartRecruitersApiWrapper.js');
const TEST_API_KEY = 'some-test-api-key';

describe('smartRecruitersApiWrapper', () => {
  describe('#get()', () => {
    it('should return candidate object for a 200 response', () => {
      const path = '/some/path/123';
      const scope = nock('https://api.smartrecruiters.com');
      scope.get(path).reply(200, {
        id: 123,
        firstName: 'Paul',
      });
      return smartRecruitersApiWrapper.get(path, TEST_API_KEY).then((candidate) => {
        assert.equal(candidate.id, 123);
        assert.equal(candidate.firstName, 'Paul');
      });
    });

    it('should return error object for a 401 response', () => {
      const path = '/some/path/456';
      const scope = nock('https://api.smartrecruiters.com');
      scope.get(path).reply(401, {
        message: 'An API error message',
      });
      return smartRecruitersApiWrapper.get(path, TEST_API_KEY).catch(err => {
        assert.deepEqual(err, {
          message: 'An API error message',
          path: '/some/path/456',
          reason: 'proxy/status',
          status: 401,
        });
      });
    });

    it('should return error object for non-JSON response', () => {
      const path = '/some/path/789';
      const scope = nock('https://api.smartrecruiters.com');
      scope.get(path).reply(200, 'This is not JSON', {'Content-Type': 'text/html'});
      return smartRecruitersApiWrapper.get(path, TEST_API_KEY).catch(err => {
        console.log(JSON.stringify(err));
        assert.deepEqual(err, {
          message: 'Unexpected content type: text/html',
          path: '/some/path/789',
          reason: 'proxy/content-type',
          status: 200,
        });
      });
    });
  });
});
