/* eslint-disable max-len */
'use strict';

const SUPPORTED_BULLET_CHARACTERS = ['•', '●', '\\*', '-'];

function getCharacterFreq(s, c) {
  return (s.match(new RegExp(c, 'g')) || []).length;
}

function getBulletChar(s) {
  const best = {
    char: undefined,
    index: Number.MAX_SAFE_INTEGER,
  };

  SUPPORTED_BULLET_CHARACTERS.forEach(c => {
    // Need to unescape for the indexOf
    let findCh = c === '\\*' ? '*' : c;
    // Only consider dashes prefixed with newline characters
    findCh = findCh === '-' ? '\n-' : findCh;
    const index = s.indexOf(findCh);
    if (index !== -1 && index < best.index && getCharacterFreq(s, c) > 1) {
      best.index = index;
      best.char = c;
    }
  });
  return best.char;
}

function removeNewLinesBetweenBullets(s, bulletChar) {
  // Note the regex meta sequence characters \s and \S need two \\ here
  const re = `${bulletChar}[\\s\\S]+?(?=(${bulletChar}|\n\n))`;
  return s.replace(new RegExp(re, 'g'), m => {
    return m.replace(/\n/g, ' ') + '\n';
  });
}

function fixBulletsAndParagraphs(s) {
  if (!s) return '';
  let adapted = s;
  const bulletChar = getBulletChar(adapted);

  if (bulletChar) {
    if (bulletChar !== '-') {
      // Replace sequential bullet characters (e.g. ••• or **) with a single bullet
      adapted = adapted.replace(new RegExp(bulletChar + '+', 'g'), (bulletChar === '\\*' ? '*' : bulletChar));
      adapted = removeNewLinesBetweenBullets(adapted, bulletChar);
    }

    // Avoids need for string start & end edge case regex's
    adapted = '\n' + adapted + '\n';

    adapted = adapted.replace(
      new RegExp(`\n+[ \t]?${bulletChar}[ \t]?`, 'g'),
      '\n<li>',
    ); // <li>

    if (bulletChar !== '-') {
      // Second version without newline prefix
      adapted = adapted.replace(
        new RegExp(`[ \t]?${bulletChar}[ \t]?`, 'g'),
        '\n<li>',
      );
    }

    adapted = adapted.replace(/(<li>[\s\S]+?)[\t ]*\n/g, '$1</li>');
    adapted = adapted.replace(/((?!<\/li>)\n<li>)/g, '</p><ul><li>');
    adapted = adapted.replace(/(<\/li>)(?!<li>)/g, '$1</ul><p>');
  }

  adapted = adapted.replace(/^/, '<p>');
  adapted = adapted.replace(/$/, '</p>');

  // Remove any new lines in <li> tags
  adapted = adapted.replace(/<li>[\s\S]+?<\/li>/g, m => {
    return m.replace(/\n/g, ' ');
  });

  // Remove leading spaces from bullets
  adapted = adapted.replace(/<li> +/g, '<li>');

  // Replace all other new lines with another paragaph
  adapted = adapted.replace(/\n/g, '</p><p>');

  // Normalise space
  adapted = adapted.replace(/ +/g, ' ');

  // Lose empty paragraphs
  adapted = adapted.replace(/<p><\/p>/g, '');

  return adapted;
}

module.exports = {
  fixBulletsAndParagraphs: fixBulletsAndParagraphs,
};
