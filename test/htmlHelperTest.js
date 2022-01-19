/* eslint-disable max-len */
'use strict';

const assert = require('chai').assert;
const {fixBulletsAndParagraphs} = require('../htmlHelper.js');

describe('htmlHelper', () => {
  describe('#fixBulletsAndParagraphs()', () => {
    // No text
    it('should return empty string', () => assert.equal(fixBulletsAndParagraphs(''), ''));
    // Regular text
    it('should add <p> for text', () => assert.equal(fixBulletsAndParagraphs('some text'), '<p>some text</p>'));
    it('should add multple <p> for text with newlines', () => assert.equal(fixBulletsAndParagraphs('para one\npara two'), '<p>para one</p><p>para two</p>'));
    // Bullet only text
    it('should add <ul> for bullet with newline (\\n•[ \\t])', () => assert.equal(fixBulletsAndParagraphs('•\tBullet 1\n• Bullet 2\n•\tBullet 3'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should add <ul> for bullet without newline (•[ \\t])', () => assert.equal(fixBulletsAndParagraphs('•\tBullet 1 • Bullet 2 •\tBullet 3'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should add <ul> for fat bullet with newline (\\n●[ \\t])', () => assert.equal(fixBulletsAndParagraphs('●\tBullet 1\n● Bullet 2\n●\tBullet 3'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should add <ul> for fat bullet without newline (●[ \\t])', () => assert.equal(fixBulletsAndParagraphs('●\tBullet 1 ● Bullet 2 ●\tBullet 3'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should add <ul> for asterix with newline (\\n*[ \\t])', () => assert.equal(fixBulletsAndParagraphs('*\tBullet 1\n* Bullet 2\n*\tBullet 3'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should add <ul> for asterix without newline (*[ \\t])', () => assert.equal(fixBulletsAndParagraphs('*\tBullet 1 * Bullet 2 *\tBullet 3'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    // NB: No trailing white space...
    it('should add <ul> for dashes with a newline (\\n-[ \\t])', () => assert.equal(fixBulletsAndParagraphs('-\tBullet 1\n- Bullet 2\n-\tBullet 3'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should not add <ul> for dashes without a newline (-[ \\t])', () => assert.equal(fixBulletsAndParagraphs('-\tBullet 1 - Bullet 2 -\tBullet 3'), '<p>-\tBullet 1 - Bullet 2 -\tBullet 3</p>'));

    // Regular text & bullets
    it('should add <p> & <ul> (\\n•[ \\t])', () => assert.equal(fixBulletsAndParagraphs('Key achievements:\n•\tBullet 1\n• Bullet 2\n•\tBullet 3'), '<p>Key achievements:</p><ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should add <p> & <ul> (*[ \\t])', () => assert.equal(fixBulletsAndParagraphs('Key achievements: *\tBullet 1 * Bullet 2 *\tBullet 3'), '<p>Key achievements:</p><ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should add <p> & <ul> (mix of \\n\\n\\t• and \\n\\t• )', () => assert.equal(fixBulletsAndParagraphs('paragaph text\n\n\t• bullet one\n\t• bullet two\n\t• bullet three\n\n\t• bullet four\n\n\t• bullet five\n\n\t• bullet six'), '<p>paragaph text</p><ul><li>bullet one</li><li>bullet two</li><li>bullet three</li><li>bullet four</li><li>bullet five</li><li>bullet six</li></ul>'));

    // Bullets & regular text
    it('should add <ul> & <p> (\\n•[ \\t])', () => assert.equal(fixBulletsAndParagraphs('•\tBullet 1\n• Bullet 2\n•\tBullet 3\nNormal text'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul><p>Normal text</p>'));
    it('should add <ul> & <ul> (*[ \\t])', () => assert.equal(fixBulletsAndParagraphs('*\tBullet 1 * Bullet 2 *\tBullet 3\nNormal text'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul><p>Normal text</p>'));

    // Regular text, bullets & regular text
    it('should add <p>, <ul> & <p> (\\n•[ \\t])', () => assert.equal(fixBulletsAndParagraphs('Key achievements:\n•\tBullet 1\n• Bullet 2\n•\tBullet 3\nNormal text'), '<p>Key achievements:</p><ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul><p>Normal text</p>'));

    it('should remove leading spaces from bullet texts', () => assert.equal(fixBulletsAndParagraphs('\t•\tBullet 1\n\t•\t Bullet 2\n\t•\t   Bullet 3'), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));
    it('should remove trailing spaces and tabs from bullet texts', () => assert.equal(fixBulletsAndParagraphs('•\tBullet 1\t\n• Bullet 2\t \t\n•\tBullet 3 '), '<ul><li>Bullet 1</li><li>Bullet 2</li><li>Bullet 3</li></ul>'));

    // Edge case for newlines within bullet point texts (here "Bullet\nTwo")
    it('should subsitute newlines in bullet text to spaces (\\n•[ \\t])', () => assert.equal(fixBulletsAndParagraphs('•\Bullet one\n•\tBullet\ntwo\n•\tBullet three'), '<ul><li>Bullet one</li><li>Bullet two</li><li>Bullet three</li></ul>'));

    // Multiple regular texts and bullet point sets
    const testInput1 = 'Key achievements:\n•\tSuccessful development \n•\tWinning the RBS\n•\tSuccessful division\n\nResponsibilities:\n•\tDevelopment of a digital marketing website\n•\tProject management\n•\tManagement of agency timelines \n•\tManagement of staff \n•\tTracking and reporting performance against campaign targets';
    const expectedOutput1 = '<p>Key achievements:</p><ul><li>Successful development</li><li>Winning the RBS</li><li>Successful division</li></ul><p>Responsibilities:</p><ul><li>Development of a digital marketing website</li><li>Project management</li><li>Management of agency timelines</li><li>Management of staff</li><li>Tracking and reporting performance against campaign targets</li></ul>';
    it("should add multiple <p> & <ul>'s (\\n•[ \\t])", () => assert.equal(fixBulletsAndParagraphs(testInput1), expectedOutput1));

    const testInput2 = "Trevor's role at E.ON is to assist in the growth of the B2C solutions.    *   Increased sales by 25% online with YoY increase of £1.2M    *   Operational cost savings of £400K per annum    *   Successful integration with BNPP finance partner increasing finance        applications for Heating and Photovolics";
    const expectedOutput2 = "<p>Trevor's role at E.ON is to assist in the growth of the B2C solutions. </p><ul><li>Increased sales by 25% online with YoY increase of £1.2M</li><li>Operational cost savings of £400K per annum</li><li>Successful integration with BNPP finance partner increasing finance applications for Heating and Photovolics</li></ul>";
    it("should add multiple <p> & <ul>\'s (*[ \\t])", () => assert.equal(fixBulletsAndParagraphs(testInput2), expectedOutput2));


    it('should fix sequential bullet characters (*)', () => assert.equal(fixBulletsAndParagraphs('* One ** Two *** Three'), '<ul><li>One</li><li>Two</li><li>Three</li></ul>'));
    it('should fix sequential bullet characters (•)', () => assert.equal(fixBulletsAndParagraphs('• One •• Two ••• Three'), '<ul><li>One</li><li>Two</li><li>Three</li></ul>'));
    it('should fix sequential bullet characters (• + \\n)', () => assert.equal(fixBulletsAndParagraphs('• One\n•• Two\n••• Three'), '<ul><li>One</li><li>Two</li><li>Three</li></ul>'));
    it('should fix sequential bullet characters (•\\t + \\n)', () => assert.equal(fixBulletsAndParagraphs('•\tOne\n••\tTwo\n•••\tThree'), '<ul><li>One</li><li>Two</li><li>Three</li></ul>'));
  });
});
