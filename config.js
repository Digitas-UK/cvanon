/* eslint-disable max-len */
'use strict';

const dotenv = require('dotenv');
const fs = require('fs');

const EXPECTED_CONFIG_KEYS = ['SMART_RECRUITERS_API_KEY', 'HTTP_BASIC_AUTH_USERNAME', 'HTTP_BASIC_AUTH_PASSWORD', 'SUPPORT_EMAIL_ADDRESS', 'BOOKMARKLET_BASE_URL'];
let _config;

function getConfig() {
  if (!_config) {
    _config = dotenv.parse(fs.readFileSync('.env'));
  }
  return _config;
}


function isValid() {
  let valid = true;
  EXPECTED_CONFIG_KEYS.forEach(k => {
    if (!getConfig()[k]) {
      valid = false;
    }
  });
  return valid;
}

function getSmartRecruitersApiKey() {
  return getConfig().SMART_RECRUITERS_API_KEY || '';
}

function getHttpBasicAuthUsers() {
  const users = {};
  users[getConfig().HTTP_BASIC_AUTH_USERNAME] = getConfig().HTTP_BASIC_AUTH_PASSWORD;
  return users;
}

function getBookmarkletBaseUrl() {
  return getConfig().BOOKMARKLET_BASE_URL;
}

function getSupportEmailAddress() {
  return getConfig().SUPPORT_EMAIL_ADDRESS;
}

module.exports = {
  isValid,
  getSmartRecruitersApiKey,
  getHttpBasicAuthUsers,
  getBookmarkletBaseUrl,
  getSupportEmailAddress,
};
