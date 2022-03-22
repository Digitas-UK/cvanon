 /* eslint-disable max-len */
'use strict';

function toParagraphAndBulletsArray(text) {

  const content = [];

  // Bullet point rules (based on sample Smart Recuiters data)
  //   1. * (asterix), • (small bullet) and ● (large bullet) with an optional new line(s) and tab or space
  //   2. - (dash) with a mandatory new line and optional tab or space

  let normalised = text.replace(/\n*[\t ]?[*•●]/g, '\n•').replace(/\n[\t ]?-/g, '\n•');

  // Remove newline characters embedded between two bullets
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
