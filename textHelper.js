 /* eslint-disable max-len */
'use strict';

function toParagraphAndBulletsArray(text) {
  // Supported bullet point formats (based on sample Smart Recruiters candidate data):
  //   1. * (asterix), • (small bullet) and ● (large bullet) with optional leading new line character(s), tab or space
  //   2. - (dash) with a mandatory leading new line character and optional tab or space  
  const content = [];

  // Normalise supported bullet formats to \n•
  let normalised = text.replace(/\n*[\t ]?[*•●]/g, '\n•').replace(/\n[\t ]?-/g, '\n•');

  // Rempove newline characters embedded between two bullets
  normalised = normalised.replace(/(?<=•)[^•]+\n[^•]+(?=\n•)/g, m => m.replace('\n', ' '));

  const lines = normalised.split('\n');
  let currentBullets;
  lines.forEach(p => {
    if (p.startsWith('•')) {
      p = clean(p);
      if (p.length) {
        if (currentBullets) {
          currentBullets.bullets.push(p);
        } else {
          currentBullets = {bullets: [p]};
          content.push(currentBullets);
        }
      }
    } else {
      currentBullets = undefined;
      p = clean(p);
      if (p.length) {
        content.push({paragraph: p});
      }
    }
  });
  return content;
}

function clean(s) {
  return s.replace(/[*•●\t]/g, ' ').replace(/ +/g, ' ').trim();
}

module.exports = {
  toParagraphAndBulletsArray,
};
