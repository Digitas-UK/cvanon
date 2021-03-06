# Introduction

The Anon CV tool allows recruiters to anonymise CVs before sending them to hiring managers in order to help prevent unconscious bias from affecting the recruitment process.

The tool started life as a bespoke implementation tailored specifically to the needs of Publicis Groupe.

It is explicitly tied to the recruitment platform that their Talent team use, Smart Recruiters, and has been built so that members of the Talent team can save the tool as a bookmarklet in their browser bookmarks.

This means that when they are browsing a CV in Smart Recruiters that they think will be of interest to a hiring manager, they can simply click on the bookmarklet which scans the page, neutralises the relevant characteristics and generates an anonymised word document for the Talent team member to pass on.

Please see below for detailed instructions on how to get up and running with the tool.

# Pre-requisites

- Your Smart Recruiters account API key
- Npm & node (tested with v12.14.0)
- A Smart Recruiters website login and password (for testing)
- Microsoft Word (or compatible application that open .docx files)

# Set up

## Create a .env file in the root application directory with following secrets and configs (all mandatory):

```
SMART_RECRUITERS_API_KEY=<Your smart recruiters API key>
HTTP_BASIC_AUTH_USERNAME=<Username for HTTP basic authentication>
HTTP_BASIC_AUTH_PASSWORD=<Password for HTTP basic authentication>
SUPPORT_EMAIL_ADDRESS=someone@somewhere.net
BOOKMARKLET_BASE_URL=http://localhost:3000
```
(the username and password would be shared with the talent team users)

## Install the dependencies

```
npm install
```

## Run the server

```
npm start
```

## Add the bookmarklet to your browser's bookmarks bar

- Open the installation page http://localhost:3000/install.html
- Enter the HTTP basic user & password (as configured your .env file)
- Drag & drop the "CV Anon" bookmarklet to your browser's bookmarks bar

# General usage

- Log into Smart Recruiters https://www.smartrecruiters.com/account/sign-in
- Navigate to a candidate (or a candidate application) and click on the "CV Anon" bookmarklet in your toolbar
- If required re-enter the HTTP basic user & password (as configured your .env file)
- It should trigger a download of a Word document file (.docx) containing an anonymised version of the candidate's CV
- Open the document in Microsoft Word (or a compatible application), review and make any amends


# Notes

- The Word document formatting, boilerplate text, FAQ section can be modified by updating the templates/candidate.doc document template that uses "Handlebars-style" placeholders

## Running unit tests & code coverage
```
npm test
```

## Thanks

- The gender neutralising text rules are based on https://github.com/alexhanna/geneutext
- The Word document templating uses https://github.com/open-xml-templating/docxtemplater
