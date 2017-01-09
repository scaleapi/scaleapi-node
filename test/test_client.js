/* eslint-env mocha */
'use strict';
var scaleapi = require('../lib/scaleapi');
var chai = require('chai');
var expect = chai.expect;
var testApiKey = process.env.SCALE_TEST_API_KEY;

expect(testApiKey).to.not.be.a('null');

var client = new scaleapi.ScaleClient({apikey: testApiKey});

describe('task creation', () => {
  it('categorize', done => {
    client.createCategorizationTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Is this company public or private?',
      attachment_type: 'website',
      attachment: 'http://www.google.com/',
      categories: ['public', 'private']}, done);
  });

  it('categorize fail', done => {
    client.createCategorizationTask({
      callback_url: 'http://www.example.com/callback',
      categories: ['public', 'private']},
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });

  it('transcription', done => {
    client.createTranscriptionTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Transcribe the given fields. Then for each news item on the page, transcribe the information for the row.',
      attachment_type: 'website',
      attachment: 'http://www.google.com/',
      fields: {
        'title': 'Title of Webpage',
        'top_result': 'Title of the top result'
      },
      row_fields: {
        'username': 'Username of submitter',
        'comment_count': 'Number of comments'
      }}, done);
  });

  it('transcription fail', done => {
    client.createTranscriptionTask({
      callback_url: 'http://www.example.com/callback',
      attachment_type: 'website'},
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });

  it('phonecall', done => {
    client.createPhonecallTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Call this person and follow the script provided, recording responses',
      phone_number: '5055006865',
      entity_name: 'Alexandr Wang',
      script: 'Hello ! Are you happy today? (pause) One more thing - what is your email address?',
      fields: {'email': 'Email Address'},
      choices: ['He is happy', 'He is not happy']}, done);
  });

  it('phonecall fail', done => {
    client.createPhonecallTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Call this person and follow the script provided, recording responses'},
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });

  it('comparison', done => {
    client.createComparisonTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Do the objects in these images have the same pattern?',
      attachment_type: 'image',
      attachments: [
        'http://i.ebayimg.com/00/$T2eC16dHJGwFFZKjy5ZjBRfNyMC4Ig~~_32.JPG',
        'http://images.wisegeek.com/checkered-tablecloth.jpg'
      ],
      choices: ['yes', 'no']}, done);
  });

  it('comparison fail', done => {
    client.createComparisonTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Do the objects in these images have the same pattern?',
      attachment_type: 'image'},
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });

  it('annotation', done => {
    client.createAnnotationTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Draw a box around each **baby cow** and **big cow**',
      attachment_type: 'image',
      attachment: 'http://i.imgur.com/v4cBreD.jpg',
      objects_to_annotate: ['baby cow', 'big cow'],
      with_labels: true}, done);
  });

  it('annotation fail', done => {
    client.createAnnotationTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Draw a box around each **baby cow** and **big cow**',
      attachment_type: 'image'},
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });

  it('datacollection', done => {
    client.createDatacollectionTask({
      callback_url: 'http://www.example.com/callback',
      instruction: 'Find the URL for the hiring page for the company with attached website.',
      attachment_type: 'website',
      attachment: 'http://www.google.com/',
      fields: { 'hiring_page': 'Hiring Page URL' }}, done);
  });

  it('datacollection fail', done => {
    client.createDatacollectionTask({
      callback_url: 'http://www.example.com/callback',
      attachment_type: 'website'},
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });

  it('audiotranscription', done => {
    client.createAudiotranscriptionTask({
      callback_url: 'http://www.example.com/callback',
      attachment_type: 'audio',
      attachment: 'https://storage.googleapis.com/deepmind-media/pixie/knowing-what-to-say/second-list/speaker-3.wav',
      verbatim: false}, done);
  });

  it('audiotranscription fail', done => {
    client.createAudiotranscriptionTask({
      callback_url: 'http://www.example.com/callback',
      attachment_type: 'audio'},
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });
});
