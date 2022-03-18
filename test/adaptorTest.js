/* eslint-disable max-len */
'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const adaptor = require('../adaptor.js');

describe('adaptor', () => {
  // Make new Date() return a fixed date
  sinon.useFakeTimers(new Date('2022-01-19').getTime());

  describe('#candidate()', () => {
    describe('#candidate() with minimal input', () => {
      const candidate = adaptor.candidate(createCandidateTestInputObject(), {});
      it('should have candidate id', () => assert.equal(candidate.candidateId, 'abc-123'));
      it('should have initals', () => assert.equal(candidate.initials, 'JS'));
      it('should have job title', () => assert.equal(candidate.jobTitle, 'Account Manager'));
      it('should have ref', () => assert.equal(candidate.ref, 'https://smartrecruiters.com/app/people/candidates/abc-123'));
      it('should have empty positions array', () => assert.equal(candidate.positions.length, 0));
      it('should have empty tags array', () => assert.equal(candidate.tags.length, 0));
      it('should have hasTags flag set to false', () => assert.isFalse(candidate.hasTags));
      it('should return expected format', () => assert.deepEqual(candidate, {
        candidateId: 'abc-123',
        hasTags: false,
        initials: 'JS',
        jobTitle: 'Account Manager',
        positions: [],
        ref: 'https://smartrecruiters.com/app/people/candidates/abc-123',
        tags: [],
      }));

    });

    describe('#candidate() with one job, tags and gender-specific text', () => {
      const candidate = adaptor.candidate(createCandidateTestInputObject('def-456', 'Mary', undefined, undefined, ['google-cloud', 'social-media'], [
        {
          title: 'Data Scientist',
          company: 'Sterling Cooper',
          startDate: '2015-01',
          endDate: '2020-01',
          description: 'Mary worked on a top secret project. She wrote a data harvester.',
        },
      ]), {});
      it('should have positions array with 1 item', () => assert.equal(candidate.positions.length, 1));
      it('should have position with title', () => assert.equal(candidate.positions[0].title, 'Data Scientist, Sterling Cooper'));
      it('should have position with duration', () => assert.equal(candidate.positions[0].duration, '5 years, 1 month'));
      it('should have position with gender neutralised text', () => assert.equal(candidate.positions[0].text, 'The candidate worked on a top secret project. They wrote a data harvester.'));
      it('should have tags array with 2 items', () => assert.equal(candidate.tags.length, 2));
      it('should have hasTags flag set to true', () => assert.isTrue(candidate.hasTags));
      it('should return expected format', () => assert.deepEqual(candidate, {
        candidateId: 'def-456',
        hasTags: true,
        initials: 'MS',
        jobTitle: 'Account Manager',
        positions: [
          {
            duration: '5 years, 1 month',
            text: 'The candidate worked on a top secret project. They wrote a data harvester.',
            title: 'Data Scientist, Sterling Cooper',
          },
        ],
        ref: 'https://smartrecruiters.com/app/people/candidates/def-456',
        tags: ['google-cloud', 'social-media'],
      }));
    });

    describe('#candidate() with six unordered jobs', () => {
      const candidate = adaptor.candidate(createCandidateTestInputObject(undefined, undefined, undefined, undefined, undefined, [
        {
          company: 'Fourth Job',
          startDate: '2006-01',
          endDate: '2009-12',
        },
        {
          company: 'Fifth Job',
          startDate: '2010-01',
          endDate: '2014-12',
        },
        {
          company: 'First Job',
          startDate: '2000-01',
          endDate: '2000-12',
        },
        {
          company: 'Third Job',
          startDate: '2003-01',
          endDate: '2005-12',
        },
        {
          company: 'Sixth Job',
          startDate: '2015-01',
          endDate: '2020-12',
        },
        {
          company: 'Second Job',
          startDate: '2001-01',
          endDate: '2002-12',
        },
      ]), {
        numberOfPositions: 5,
      });
      it('should have 5 positions', () => assert.equal(candidate.positions.length, 5));
      it('should set first position to most recent', () => assert.equal(candidate.positions[0].title, 'Sixth Job'));
      it('should set second position to second most recent', () => assert.equal(candidate.positions[1].title, 'Fifth Job'));
      it('should set third position to third most recent', () => assert.equal(candidate.positions[2].title, 'Fourth Job'));
      it('should set fourth position to fourth most recent', () => assert.equal(candidate.positions[3].title, 'Third Job'));
      it('should set fifth position to fifth most recent', () => assert.equal(candidate.positions[4].title, 'Second Job'));
    });
  });

  describe('#notes()', () => {
    describe('#notes() with screening notes', () => {
      const src = {
        totalFound: 1,
        content: [
          {
            id: '939f5a59-2c4e-41ef-b1f9-e401fa5a58bd',
            type: 'radio',
            category: '29f34fb3-dbc2-4710-a76f-37b79b9cd047',
            name: 'Employment Visa Status',
            label: 'Will you now or in the future require sponsorship for employment visa status?',
            records: [
              {
                fields: [
                  {
                    id: 'value',
                    label: 'Value',
                    values: [
                      {
                        id: '0',
                        label: 'No',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      it('should return notes string in expected format', () => assert.equal(adaptor.notes(src, null, null), 'Will you now or in the future require sponsorship for employment visa status? No'));
    });

    describe('#notes() without screening notes', () => {
      const src = {
        totalFound: 0,
        content: [],
      };
      it('should return an empty string', () => assert.equal(adaptor.notes(src, null, null), ''));
    });
  });

  describe('#getTitle()', () => {
    it('should return job title and company', () => assert.equal(adaptor._getTitle({
      title: 'Technical Architect',
      company: 'Hooli',
    }, '206cd39b-98f1-44c2-a229-91c1f0758e4d'), 'Technical Architect, Hooli'));
    it('should return job title', () => assert.equal(adaptor._getTitle({
      title: 'Technical Architect',
      company: '',
    }, '206cd39b-98f1-44c2-a229-91c1f0758e4d'), 'Technical Architect'));
    it('should return company', () => assert.equal(adaptor._getTitle({
      company: 'Hooli',
    }, '206cd39b-98f1-44c2-a229-91c1f0758e4d'), 'Hooli'));
    it('should return gender-neutralised job title (full match)', () => assert.equal(adaptor._getTitle({
      title: 'Chairman',
    }, {
      url: '/some/url',
    }), 'Chairperson'));
    it('should return gender-neutralised job title (partial match)', () => assert.equal(adaptor._getTitle({
      title: 'Head Stewardess',
    }, '206cd39b-98f1-44c2-a229-91c1f0758e4d'), 'Head Flight Attendant'));
  });

  describe('#calculateDuration()', () => {
    it('should return 1 month', () => assert.equal(adaptor._calculateDuration({
      startDate: '2000-01',
      endDate: '2000-01',
    }), '1 month'));
    it('should return 2 months', () => assert.equal(adaptor._calculateDuration({
      startDate: '2000-01',
      endDate: '2000-02',
    }), '2 months'));
    it('should return 1 year', () => assert.equal(adaptor._calculateDuration({
      startDate: '2000-01',
      endDate: '2000-12',
    }), '1 year'));
    it('should return 1 year, 1 month', () => assert.equal(adaptor._calculateDuration({
      startDate: '2000-01',
      endDate: '2001-01',
    }), '1 year, 1 month'));
    it('should return 1 year, 2 months', () => assert.equal(adaptor._calculateDuration({
      startDate: '2000-01',
      endDate: '2001-02',
    }), '1 year, 2 months'));
    it('should return 2 years', () => assert.equal(adaptor._calculateDuration({
      startDate: '2000-01',
      endDate: '2001-12',
    }), '2 years'));
    it('should return 1 month for current', () => assert.equal(adaptor._calculateDuration({
      startDate: '2022-01',
      current: true,
    }), '1 month'));
    it('should return 1 year for current', () => assert.equal(adaptor._calculateDuration({
      startDate: '2021-02',
      current: true,
    }), '1 year'));
  });

  describe('#genderNeutralise()', () => {

    it('... she is ...', () => assert.equal(adaptor._genderNeutralise('and she is on the commitee'), 'and they are on the commitee'));
    it('... she\'s ...', () => assert.equal(adaptor._genderNeutralise('and she\'s previously'), 'and they\'re previously'));
    it('... she was ...', () => assert.equal(adaptor._genderNeutralise('at somewhere she was responsible'), 'at somewhere they were responsible'));
    it('... she has ...', () => assert.equal(adaptor._genderNeutralise('and she has excellent'), 'and they have excellent'));
    it('... her.', () => assert.equal(adaptor._genderNeutralise('awarded to her.'), 'awarded to them.'));
    it('... hers!', () => assert.equal(adaptor._genderNeutralise('it was all hers!'), 'it was all theirs!'));
    it('... herself...', () => assert.equal(adaptor._genderNeutralise('managed it herself'), 'managed it themself'));

    it('... he is ...', () => assert.equal(adaptor._genderNeutralise('and she is on the commitee'), 'and they are on the commitee'));
    it('... he\'s ...', () => assert.equal(adaptor._genderNeutralise('and she\'s previously'), 'and they\'re previously'));
    it('... he was ...', () => assert.equal(adaptor._genderNeutralise('at somewhere she was responsible'), 'at somewhere they were responsible'));
    it('... he has ...', () => assert.equal(adaptor._genderNeutralise('and she has excellent'), 'and they have excellent'));
    it('... his.', () => assert.equal(adaptor._genderNeutralise('awarded to her.'), 'awarded to them.'));
    it('... his!', () => assert.equal(adaptor._genderNeutralise('it was all hers!'), 'it was all theirs!'));
    it('... himself...', () => assert.equal(adaptor._genderNeutralise('managed it herself'), 'managed it themself'));

    it('^She was... ', () => assert.equal(adaptor._genderNeutralise('She was responsible'), 'They were responsible'));
    it('^she was.. ', () => assert.equal(adaptor._genderNeutralise('she was responsible'), 'they were responsible'));
    it(', she was..', () => assert.equal(adaptor._genderNeutralise(', she was responsible'), ', they were responsible'));

    it('ko_she_r', () => assert.equal(adaptor._genderNeutralise('kosher food'), 'kosher food'));
    it('t_him_ble', () => assert.equal(adaptor._genderNeutralise('thimble'), 'thimble'));
  });
});

function createCandidateTestInputObject(id = 'abc-123', firstName = 'John', lastName = 'Smith', jobTitle = 'Account Manager', tags = [], experience = []){
  return {
    id: id,
    firstName: firstName,
    lastName: lastName,
    primaryAssignment: {
      job: {
        title: jobTitle,
      },
    },
    tags: tags,
    experience: experience,
  };
}
