/* eslint-env mocha */
'use strict';
var async = require('async');
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

  it('audiotranscription fail2', done => {
    client.createAudiotranscriptionTask({
      callback_url: 'http://www.example.com/callback',
      attachment: 'some_non_url'},
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });
});

var MAKE_A_TASK = cb => client.createComparisonTask({
  callback_url: 'http://www.example.com/callback',
  instruction: 'Do the objects in these images have the same pattern?',
  attachment_type: 'image',
  attachments: [
    'http://i.ebayimg.com/00/$T2eC16dHJGwFFZKjy5ZjBRfNyMC4Ig~~_32.JPG',
    'http://images.wisegeek.com/checkered-tablecloth.jpg'
  ],
  choices: ['yes', 'no']}, cb);

describe('task methods', () => {
  it('test cancel', done => {
    async.waterfall([
      MAKE_A_TASK,
      (task, cb) => task.cancel(cb)],
      //since test tasks complete instantly, we expect cancellation to fail
      err => {
        expect(err).to.be.an.instanceof(scaleapi.ScaleException);
        done();
      });
  });

  it('test task retrieval', done => {
    var task1;
    async.waterfall([
      MAKE_A_TASK,
      (task, cb) => {
        task1 = task;
        client.fetchTask(task.id, cb);
      }],
      (err, task2) => {
        expect(task1.status).to.equal('pending');
        expect(task2.status).to.equal('completed');
        var fields = [
          'id', 'callback_url', 'instruction',
          'attachment_type', 'attachment', 'choices',
          'metadata', 'type', 'created_at'
        ];
        fields.forEach(field => expect(task1[field]).to.eql(task2[field]));
        done();
      });
  });

  it('test task retrieval time', done => {
    var startTime;
    var endTime;
    async.waterfall([
      MAKE_A_TASK,
      (task, cb) => setTimeout(cb, 500),
      cb => {startTime = (new Date()).toISOString(); cb();},
      cb => setTimeout(cb, 500),
      cb => {endTime = (new Date()).toISOString(); cb();},
      cb => client.tasks({start_time: startTime, end_time: endTime}, cb),
    ], (err, tasks) => {
      expect(tasks).to.be.empty;
      done();
    });
  });

  it('test task retrieval fail', done => {
    client.fetchTask('fake_id_qwertyuiop', err => {
      expect(err).to.be.an.instanceof(scaleapi.ScaleException);
      done();
    });
  });

  it('test tasks', done => {
    var tasks = [];
    async.waterfall([
      MAKE_A_TASK,
      (task, cb) => { tasks.push(task); cb(); },
      MAKE_A_TASK,
      (task, cb) => { tasks.push(task); cb(); },
      MAKE_A_TASK,
      (task, cb) => { tasks.push(task); cb(); },
      cb => client.tasks({limit: 3}, cb)
    ], (err, res) => {
      var taskids = tasks.map(task => task.id);
      var retrievedTaskIds = res.map(task => task.id);
      expect(taskids).to.have.members(retrievedTaskIds);
      done();
    });
  });

  it('test tasks invalid', done => {
    client.tasks({bogus: 0}, err => {
      expect(err).to.be.an.instanceof(scaleapi.ScaleException);
      done();
    });
  });
});
