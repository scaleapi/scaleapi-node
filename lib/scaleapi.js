'use strict';
var request = require('request');

var DEFAULT_FIELDS = ['callback_url', 'instruction', 'urgency', 'metadata'];
var ALLOWED_FIELDS = {'categorization': ['attachment', 'attachment_type', 'categories',
  'category_ids', 'allow_multiple'],
  'transcription': ['attachment', 'attachment_type',
  'fields', 'row_fields'],
  'phonecall': ['attachment', 'attachment_type', 'phone_number',
  'script', 'entity_name', 'fields', 'choices'],
  'comparison': ['attachments', 'attachment_type',
  'fields', 'choices'],
  'annotation': ['attachment', 'attachment_type', 'instruction',
  'objects_to_annotate', 'with_labels', 'examples'],
  'datacollection': ['attachment', 'attachment_type', 'fields'],
  'audiotranscription': ['attachment', 'attachment_type', 'verbatim']};
var SCALE_ENDPOINT = 'https://api.scaleapi.com/v1/';
var DEFAULT_LIMIT = 100;
var DEFAULT_OFFSET = 0;

/**
 * A client object configured to make Scaleapi requests.
 * operations on a database as a user. The client object is
 * created by the {@link module:scaleapi.createClient} function. 
 * @namespace ScaleClient
 */

/**
 * Creates a Scale client to make requests such as task creation, deletion,
 * or lookups. The constructor takes a configuration object with the following
 * named parameters.
 * @function module:scaleapi.createScaleClient
 * @param {string} [apikey] - your Scale API key
 * @returns {ScaleClient} a client for making Scale requests
 */
function ScaleClient(connectionParams) {
  if (!(this instanceof ScaleClient)) {
    return new ScaleClient(connectionParams);
  }

  if (!connectionParams) {
    throw new ScaleException('no connection parameters');
  }
  if (!connectionParams.apikey) {
    throw new ScaleException('missing api key');
  }
  this.apikey = connectionParams.apikey;
}

ScaleClient.prototype.fetchTask = function(taskId, cb) {
  getrequest('task/' + taskId, this.apikey, {}, (err, json) => {
    if (cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.cancelTask = function(taskId, cb) {
  getrequest('task/' + taskId + '/cancel', this.apikey, {}, (err, json) => {
    if (cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.tasks = function(params, cb) {
  var allowedKwargs = ['start_time', 'end_time', 'status', 'type', 'limit', 'offset'];
  Object.keys(params).forEach(property => {
    if (allowedKwargs.indexOf(property) < 0) {
      throw new ScaleInvalidRequest('Illegal parameter ' + property +
          ' for ScaleClient.tasks');
    }
  });
  if (allowedKwargs.limit === undefined) allowedKwargs.limit = DEFAULT_LIMIT;
  if (allowedKwargs.offset === undefined) allowedKwargs.offset = DEFAULT_OFFSET;
  getrequest('tasks', this.apikey, params, (err, json) => {
    var docs = json['docs'];
    var tasks = docs.map(json => new Task(this, json));
    if (cb) cb(err, tasks);
  });
};

ScaleClient.prototype.createCategorizationTask = function(params, cb) {
  validatePayload('categorization', params);
  postrequest('task/categorize', this.apikey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createTranscriptionTask = function(params, cb) {
  validatePayload('transcription', params);
  postrequest('task/transcription', this.apikey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createPhonecallTask = function(params, cb) {
  validatePayload('phonecall', params);
  postrequest('task/phonecall', this.apikey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createComparisonTask = function(params, cb) {
  validatePayload('comparison', params);
  postrequest('task/comparison', this.apikey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createAnnotationTask = function(params, cb) {
  validatePayload('annotation', params);
  postrequest('task/annotation', this.apikey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createDatacollectionTask = function(params, cb) {
  validatePayload('datacollection', params);
  postrequest('task/datacollection', this.apikey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createAudiotranscriptionTask = function(params, cb) {
  validatePayload('audiotranscription', params);
  postrequest('task/audiotranscription', this.apikey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

function Task(client, json) {
  this.client = client;
  this.id = json['task_id'];
  Object.assign(this, json);
}

Task.prototype.refresh = function() {
  this.client.fetchTask(this.id, task => {
    Object.assign(this, task);
  });
};

Task.prototype.cancel = function() {
  this.client.cancelTask(this.id);
};

function getrequest(endpoint, apikey, params, cb) {
  request.get({
    url: SCALE_ENDPOINT + endpoint,
    qs: params,
    json: true,
    auth: {
      user: apikey,
      pass: '',
      sendImmediately: true
    }}
  , function(error, response, body) {
    var err = null;
    if (error || response.statusCode != 200) {
      err = new ScaleException(body['error'], response.statusCode);
    }
    if (cb) cb(err, body);
  });
}

function postrequest(endpoint, apikey, payload, cb) {
  request.post({
    url: SCALE_ENDPOINT + endpoint, 
    json: payload,
    auth: {
      user: apikey,
      pass: '',
      sendImmediately: true
    }
  }, function(error, response, body) {
    var err = null;
    if (error || response.statusCode != 200) {
      err = new ScaleException(body['error'], response.statusCode);
    }
    if (cb) cb(err, body);
  });
}

function ScaleInvalidRequest(message) {
  this.message = message;
  this.name = 'ScaleInvalidRequest';
}

function ScaleException(message, errcode) {
  this.message = message;
  this.errcode = errcode;
  this.name = 'ScaleException';
}

function validatePayload(taskType, kwargs) {
  Object.keys(kwargs).forEach(property => {
    if (DEFAULT_FIELDS.indexOf(property) < 0 &&
        ALLOWED_FIELDS[taskType].indexOf(property) < 0) {
      throw new ScaleInvalidRequest('Illegal parameter ' + property +
          ' for task type ' + taskType);
    }
  });
}

module.exports = {ScaleClient: ScaleClient,
  ScaleException: ScaleException,
  ScaleInvalidRequest: ScaleInvalidRequest};
