/* eslint-disable max-len */
'use strict';

const express = require('express');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const config = require('./config');
const controller = require('./controller');
const app = express();
const port = 3000;


// Check .env file exists and contains expected secrets ahead of app startup
if (!fs.existsSync('.env') || !config.isValid()) {
  console.error('Error - .env file not found or is missing one or more secrets');
  process.exit(0);
}

// REF: https://medium.com/javascript-in-plain-english/add-basic-authentication-to-an-express-app-9536f5095e88
app.use(basicAuth({
  users: config.getHttpBasicAuthUsers(),
  challenge: true,
}));

app.set('view engine', 'ejs');

app.get('/install.html', (req, res) => res.render('install.ejs', { baseUrl: config.getBookmarkletBaseUrl() }));

app.get('/:candidateId', controller.handleCandidateRequest);

app.listen(port, () => {
  console.log(`CVAnon app listening at http://localhost:${port}`);
  console.log(`Bookmarklet page: http://localhost:${port}/install.html`);
});

module.exports = {
  app,
};
