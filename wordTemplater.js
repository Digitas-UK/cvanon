/* eslint-disable max-len */
'use strict';

const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const proofStateModule = require('docxtemplater/js/proof-state-module.js');

function render(res, template, data, filename) {
  const content = fs.readFileSync(path.resolve(__dirname, `templates/${template}`), 'binary');
  const doc = new Docxtemplater(new PizZip(content), { modules: [proofStateModule] });
  doc.setData(data);
  doc.render();

  const buffer = doc.getZip().generate({type: 'nodebuffer'});
  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.send(buffer);
  res.end();
}

module.exports = {
  render: render,
};

