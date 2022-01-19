/* eslint-disable max-len */
'use strict';

const https = require('https');
const { performance } = require('perf_hooks');
const config = require('./config');

function get(path) {
  const options = {
    hostname: 'api.smartrecruiters.com',
    port: 443,
    path: path,
    method: 'GET',
    headers: {
      'X-SmartToken': config.getSmartRecruitersApiKey(),
    },
  };
  return new Promise((resolve, reject) => {
    console.log(`PROXY: ${path} >>`);
    const start = performance.now();
    const req = https.request(options, (res) => {
      const elapsed = (performance.now() - start).toFixed(2);
      console.log(`PROXY: ${path} << ${res.statusCode} (${elapsed} ms)`);
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject({
            path: path,
            status: res.statusCode,
            message: getErrorMessage(res, body),
            reason: 'proxy/status',
          });
        } else if (!isJson(res)){
          reject({
            path: path,
            status: res.statusCode,
            message: `Unexpected content type: ${res.headers['content-type']}`,
            reason: 'proxy/content-type',
          });
        } else {
          resolve(JSON.parse(body));
        }
      });
    });

    req.on('error', (e) => {
      console.error(`PROXY: ${path} << ${e} `);
      reject({
        path: path,
        status: 500,
        message: e,
        reason: 'proxy/other',
      });
    });

    req.end();
  });
};

function getErrorMessage(res, body){
  return isJson(res) ? JSON.parse(body).message : `Unexpected status code: ${res.statusCode} (html)`;
}

function isJson(serverResponse) {
  return String(serverResponse.headers['content-type']).indexOf('application/json') !== -1;
}

module.exports = {
  get: get,
};
