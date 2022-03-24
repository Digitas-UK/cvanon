/* eslint-disable max-len */
'use strict';

const assert = require('chai').assert;
const {toParagraphAndBulletsArray} = require('../textHelper.js');

const TEST_PARAGRAPH = 'test paragraph content';
const TEST_BULLET = 'test bullet content';

describe('textHelper', () => {
  describe('#toParagraphAndBulletsArray()', () => {

    it('should return an empty array', () => assert.deepEqual(toParagraphAndBulletsArray(''), []));

    it('should return array containing a single paragraph (when no formatting characters)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(TEST_PARAGRAPH), [
        { paragraph: TEST_PARAGRAPH },
      ]));

    it('should return array of multiple paragraphs (text with newlines)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`${TEST_PARAGRAPH}\n${TEST_PARAGRAPH}`), [
        { paragraph: TEST_PARAGRAPH },
        { paragraph: TEST_PARAGRAPH },
      ]));

    it('should return array of paragraphs and bullets (using newline and asterix characters)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`${TEST_PARAGRAPH}\n\n* ${TEST_BULLET}\n*${TEST_BULLET}\n${TEST_PARAGRAPH}`), [
        { paragraph: TEST_PARAGRAPH },
        { bullets: [ TEST_BULLET, TEST_BULLET ] },
        { paragraph: TEST_PARAGRAPH },
      ]));

    it('should return array of paragraphs and bullets (using newline, tab and "•" characters)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`•\t${TEST_BULLET}\n•\t${TEST_BULLET}\n${TEST_PARAGRAPH}`), [
        { bullets: [ TEST_BULLET, TEST_BULLET ] },
        { paragraph: TEST_PARAGRAPH },
      ]));

    it('should handle bullets for small bullet character with newline (\\n•[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`•\t${TEST_BULLET}\n• ${TEST_BULLET}\n•\t${TEST_BULLET}`), [
        { bullets: [ TEST_BULLET, TEST_BULLET, TEST_BULLET ] },
      ]));

    it('should handle bullets for small bullet character without newline (•[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`•\t${TEST_BULLET} • ${TEST_BULLET} •\t${TEST_BULLET}`), [
        { bullets: [ TEST_BULLET, TEST_BULLET, TEST_BULLET ] },
      ]));

    it('should handle bullets for large bullet character with newline (\\n●[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`●\t${TEST_BULLET}\n● ${TEST_BULLET}\n●\t${TEST_BULLET}`), [
        { bullets: [ TEST_BULLET, TEST_BULLET, TEST_BULLET ] },
      ]));

    it('should handle bullets for large bullet character without newline (●[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`●\t${TEST_BULLET} ● ${TEST_BULLET} ●\t${TEST_BULLET}`), [
        { bullets: [ TEST_BULLET, TEST_BULLET, TEST_BULLET ] },
      ]));

    it('should handle bullets for asterix character with newline (\\n\*[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`*\t${TEST_BULLET}\n* ${TEST_BULLET}\n*\t${TEST_BULLET}`), [
        { bullets: [ TEST_BULLET, TEST_BULLET, TEST_BULLET ] },
      ]));

    it('should handle bullets for asterix character without newline (\*[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`*\t${TEST_BULLET} * ${TEST_BULLET} *\t${TEST_BULLET}`), [
        { bullets: [ TEST_BULLET, TEST_BULLET, TEST_BULLET ] },
      ]));

    it('should handle bullets for dash character with newline (\\n-[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`\n-\t${TEST_BULLET}\n- ${TEST_BULLET}\n-\t${TEST_BULLET}`), [
        { bullets: [ TEST_BULLET, TEST_BULLET, TEST_BULLET ] },
      ]));

    it('should NOT add bullets for - (dash) without newline (*[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`-\t${TEST_BULLET} - ${TEST_BULLET} -\t${TEST_BULLET}`), [
        { paragraph: '- test bullet content - test bullet content - test bullet content' },
      ]));

    it('should add paragraph and bullets for • (small bullet character) with newline (\\n•[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`${TEST_PARAGRAPH}\n•\t${TEST_BULLET}\n• ${TEST_BULLET}`), [
        { paragraph: TEST_PARAGRAPH },
        { bullets: [TEST_BULLET, TEST_BULLET] },
      ]));

    it('should add paragraph and bullets for * (asterix) without newline (*[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`${TEST_PARAGRAPH} *\t${TEST_BULLET} * ${TEST_BULLET}`), [
        { paragraph: TEST_PARAGRAPH },
        { bullets: [TEST_BULLET, TEST_BULLET] },
      ]));

    it('should add paragraph and bullets (mix of \\n\\n\\t• and \\n\\t•)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`${TEST_PARAGRAPH}\n\n\t• ${TEST_BULLET}\n\t• ${TEST_BULLET}\n\t• ${TEST_BULLET}\n\n\t• ${TEST_BULLET}\n\n\t• ${TEST_BULLET}\n\n\t• ${TEST_BULLET}`), [
        { paragraph: TEST_PARAGRAPH },
        { bullets: [TEST_BULLET, TEST_BULLET, TEST_BULLET, TEST_BULLET, TEST_BULLET, TEST_BULLET] },
      ]));

    it('should add bullets and paragraph for • (small bullet character) with newline (\\n•[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`•\t${TEST_BULLET}\n• ${TEST_BULLET}\n•${TEST_BULLET}\n${TEST_PARAGRAPH}`), [
        { bullets: [TEST_BULLET, TEST_BULLET, TEST_BULLET] },
        { paragraph: TEST_PARAGRAPH },
      ]));

    it('should add paragraph and bullets for * (asterix) without newline (*[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`*\t${TEST_BULLET} * ${TEST_BULLET}\n${TEST_PARAGRAPH}`), [
        { bullets: [TEST_BULLET, TEST_BULLET] },
        { paragraph: TEST_PARAGRAPH },
      ]));

    it('should add paragraph, bullets and paragraph for • (small bullet character) with newline (\\n•[ \\t])', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`${TEST_PARAGRAPH}\n•\t${TEST_BULLET}\n• ${TEST_BULLET}\n•${TEST_BULLET}\n${TEST_PARAGRAPH}`), [
        { paragraph: TEST_PARAGRAPH },
        { bullets: [TEST_BULLET, TEST_BULLET, TEST_BULLET] },
        { paragraph: TEST_PARAGRAPH },
      ]));

    it('should remove leading spaces from bullet texts', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`\t•\t${TEST_BULLET}\n\t•\t ${TEST_BULLET}\n\t•\t   ${TEST_BULLET}`), [
        { bullets: [TEST_BULLET, TEST_BULLET, TEST_BULLET] },
      ]));

    it('should remove trailing spaces and tabs from bullet texts', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`•\t${TEST_BULLET}\t\n• ${TEST_BULLET}\t \t\n•\t${TEST_BULLET}   `), [
        { bullets: [TEST_BULLET, TEST_BULLET, TEST_BULLET] },
      ]));

    it('should subsitute newlines in bullet text to spaces (edge case for newlines within bullet point texts)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`•\t${TEST_BULLET}\n•\tbefore newline\nafter newline\n•\t${TEST_BULLET}`), [
        { bullets: [TEST_BULLET, 'before newline after newline', TEST_BULLET] },
      ]));

    it('should handle multiple paragraph and bullet point sets (•)', () =>
      assert.deepEqual(toParagraphAndBulletsArray('Key achievements:\n•\tSuccessful development \n•\tWinning the RBS\n•\tSuccessful division\n\nResponsibilities:\n•\tDevelopment of a digital marketing website\n•\tProject management\n•\tManagement of agency timelines \n•\tManagement of staff'), [
        { paragraph: 'Key achievements:' },
        { bullets: ['Successful development', 'Winning the RBS', 'Successful division'] },
        { paragraph: 'Responsibilities:' },
        { bullets: [
          'Development of a digital marketing website',
          'Project management',
          'Management of agency timelines',
          'Management of staff',
        ]},
      ]));

    it('should handle multiple paragraph and bullet point sets (*)', () =>
      assert.deepEqual(toParagraphAndBulletsArray('Trevor\'s role at E.ON is to assist in the growth of the B2C solutions.    *   Increased sales by 25% online with YoY increase of £1.2M    *   Operational cost savings of £400K per annum    *   Successful integration with BNPP finance partner increasing finance        applications for Heating and Photovolics'), [
        { paragraph: 'Trevor\'s role at E.ON is to assist in the growth of the B2C solutions.' },
        { bullets: [
          'Increased sales by 25% online with YoY increase of £1.2M',
          'Operational cost savings of £400K per annum',
          'Successful integration with BNPP finance partner increasing finance applications for Heating and Photovolics',
        ]},
      ]));

    it('should fix sequential bullet characters (*)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`• ${TEST_BULLET} •• ${TEST_BULLET} ••• ${TEST_BULLET}`), [
        { bullets: [TEST_BULLET, TEST_BULLET, TEST_BULLET] },
      ]));

    it('should fix sequential bullet characters (• + \\n)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`• ${TEST_BULLET}\n•• ${TEST_BULLET}\n••• ${TEST_BULLET}`), [
        { bullets: [TEST_BULLET, TEST_BULLET, TEST_BULLET] },
      ]));

    it('should fix sequential bullet characters (•\\t + \\n)', () =>
      assert.deepEqual(toParagraphAndBulletsArray(`•\t${TEST_BULLET}\n••\t${TEST_BULLET}\n•••\t${TEST_BULLET}`), [
        { bullets: [TEST_BULLET, TEST_BULLET, TEST_BULLET] },
      ]));
  });
});
