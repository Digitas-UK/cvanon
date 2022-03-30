/* eslint-disable max-len */
'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const fs = require('fs');
const config = require('../config.js');

const TEST_API_KEY = '1234567';
const TEST_USERNAME = 'someuser';
const TEST_PASSWORD = 'secret';
const TEST_EMAIL = 'someone@somewhere.net';
const TEST_URL = 'https://somewhere.net';

const TEST_DOTENV_FILE_CONTENTS = `SMART_RECRUITERS_API_KEY=${TEST_API_KEY}
HTTP_BASIC_AUTH_USERNAME=${TEST_USERNAME}
HTTP_BASIC_AUTH_PASSWORD=${TEST_PASSWORD}
SUPPORT_EMAIL_ADDRESS=${TEST_EMAIL}
BOOKMARKLET_BASE_URL=${TEST_URL}
`;

describe('config', () => {

  beforeEach(() => {
    sinon.stub(fs, 'readFileSync').withArgs('.env').returns(TEST_DOTENV_FILE_CONTENTS);
  });

  afterEach(() => {
    fs.readFileSync.restore();
  });

  describe('#isValid()', () => {
    it('should return true when .env file contains expected config', () => {
      assert.isTrue(config.isValid());
    });
  });

  describe('#getSmartRecruitersApiKey()', () => {
    it('should return configured api key', () => {
      assert.equal(config.getSmartRecruitersApiKey(), TEST_API_KEY);
    });
  });

  describe('#getHttpBasicAuthUsers()', () => {
    it('should return object with configured user and password', () => {
      assert.deepEqual(config.getHttpBasicAuthUsers(), JSON.parse(`{ "${TEST_USERNAME}" : "${TEST_PASSWORD}" }`));
    });
  });

  describe('#getSupportEmailAddress()', () => {
    it('should return configured email', () => {
      assert.equal(config.getSupportEmailAddress(), TEST_EMAIL);
    });
  });

  describe('#getBookmarkletBaseUrl()', () => {
    it('should return configured url', () => {
      assert.equal(config.getBookmarkletBaseUrl(), TEST_URL);
    });
  });
});
