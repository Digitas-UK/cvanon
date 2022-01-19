/* eslint-disable max-len */
'use strict';

const dotenv = require('dotenv');
const fs = require('fs');

const EXPECTED_CONFIG_KEYS = ['SMART_RECRUITERS_API_KEY', 'HTTP_BASIC_AUTH_USERNAME', 'HTTP_BASIC_AUTH_PASSWORD', 'SUPPORT_EMAIL_ADDRESS', 'BOOKMARKLET_BASE_URL'];
const config = dotenv.parse(fs.readFileSync('.env'));

function isValid() {
  let valid = true;
  EXPECTED_CONFIG_KEYS.forEach(k => {
    if (!config[k]) {
      console.log(k);
      valid = false;
    }
  });
  return valid;
}

function getSmartRecruitersApiKey() {
  return config.SMART_RECRUITERS_API_KEY;
}

function getHttpBasicAuthUsers() {
  const users = {};
  users[config.HTTP_BASIC_AUTH_USERNAME] = config.HTTP_BASIC_AUTH_PASSWORD;
  return users;
}

function getBookmarkletBaseUrl() {
  return config.BOOKMARKLET_BASE_URL;
}

function getSupportEmailAddress() {
  return config.SUPPORT_EMAIL_ADDRESS;
}

module.exports = {
  isValid: isValid,
  getSmartRecruitersApiKey: getSmartRecruitersApiKey,
  getHttpBasicAuthUsers: getHttpBasicAuthUsers,
  getBookmarkletBaseUrl: getBookmarkletBaseUrl,
  getSupportEmailAddress: getSupportEmailAddress,
};
