'use strict';
var request = require('request');

var DEFAULT_FIELDS = ['callback_url', 'instruction', 'urgency', 'metadata'];
var ALLOWED_FIELDS = {
  'categorization':
    ['attachment', 'attachment_type', 'categories', 'category_ids', 'allow_multiple'],
  'transcription':
    ['attachment', 'attachment_type', 'fields', 'repeatable_fields'],
  'phonecall':
    ['attachment', 'attachment_type', 'phone_number', 'script', 'entity_name', 'fields', 'choices'],
  'comparison':
    ['attachments', 'attachment_type', 'fields', 'choices'],
  'annotation':
    ['attachment', 'attachment_type', 'instruction', 'objects_to_annotate', 'with_labels', 'examples', 'min_width', 'min_height'],
  'polygonannotation':
    ['attachment', 'attachment_type', 'instruction', 'objects_to_annotate', 'with_labels', 'examples'],
  'lineannotation':
    ['attachment', 'attachment_type', 'instruction', 'objects_to_annotate', 'with_labels', 'examples'],
  'datacollection': ['attachment', 'attachment_type', 'fields'],
  'audiotranscription': ['attachment', 'attachment_type', 'verbatim']
};
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
 * Creates a ScaleClient to make requests such as task creation, deletion,
 * or lookups. The constructor takes a configuration object with the following
 * named parameters.
 * @constructor
 * @param {string} apiKey- your Scale API key
 * @returns {ScaleClient} a client for making Scale requests
 */
function ScaleClient(apiKey) {
  if (!(this instanceof ScaleClient)) {
    return new ScaleClient(apiKey);
  }

  if (!apiKey) {
    throw new ScaleException('missing api key');
  }
  this.apiKey = apiKey;
}

/**
 * Fetches a task.
 * @method scaleapi.ScaleClient#fetchTask
 * @param {string} taskId - the task id
 * @param {function} cb - callback called with (err, task)
 */
ScaleClient.prototype.fetchTask = function(taskId, cb) {
  getrequest('task/' + taskId, this.apiKey, {}, (err, json) => {
    if (cb) cb(err, new Task(this, json));
  });
};

/**
 * Cancels a task.
 * @method scaleapi.ScaleClient#cancelTask
 * @param {string} taskId - the task id
 * @param {function} cb - callback called with (err, task)
 */
ScaleClient.prototype.cancelTask = function(taskId, cb) {
  postrequest('task/' + taskId + '/cancel', this.apiKey, {}, (err, json) => {
    if (cb) cb(err, new Task(this, json));
  });
};

/**
 * Fetches a list of tasks. Takes a set of parameters, and a callback function.
 * Callback is called with a list of tasks, which also has properties
 * tasks.total (number of tasks retrieved), tasks.limit, tasks.offset,
 * tasks.hasMore (whether or not there are more tasks)
 *
 * Returns up to 100 at a time, use offset to paginate tasks and fetch more.
 *
 * @method scaleapi.ScaleClient#tasks
 * @param {Object} params - task retrieval parameters
 * @param {string} params.start_time - ISO date representing beginning of date range
 * @param {string} params.end_time - ISO date representing end of date range
 * @param {string} params.status - fetch only tasks with status: 'completed', 'pending', or 'canceled'
 * @param {string} params.type - fetch only tasks of this type
 * @param {Number} params.limit - max number of results
 * @param {Number} params.offset - number of results to skip
 * @param {function} cb - callback called with (err, tasks)
 */
ScaleClient.prototype.tasks = function(params, cb) {
  var allowedKwargs = ['start_time', 'end_time', 'status', 'type', 'limit', 'offset'];
  Object.keys(params).forEach(property => {
    if (allowedKwargs.indexOf(property) < 0) {
      cb(new ScaleInvalidRequest('Illegal parameter ' + property +
          ' for ScaleClient.tasks'), null);
    }
  });
  if (allowedKwargs.limit === undefined) allowedKwargs.limit = DEFAULT_LIMIT;
  if (allowedKwargs.offset === undefined) allowedKwargs.offset = DEFAULT_OFFSET;
  getrequest('tasks', this.apiKey, params, (err, json) => {
    json.docs = json.docs.map(json => new Task(this, json));
    if (cb) cb(err, json);
  });
};

ScaleClient.prototype.createCategorizationTask = function(params, cb) {
  validatePayload('categorization', params);
  postrequest('task/categorize', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createTranscriptionTask = function(params, cb) {
  validatePayload('transcription', params);
  postrequest('task/transcription', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createPhonecallTask = function(params, cb) {
  validatePayload('phonecall', params);
  postrequest('task/phonecall', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createComparisonTask = function(params, cb) {
  validatePayload('comparison', params);
  postrequest('task/comparison', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createAnnotationTask = function(params, cb) {
  validatePayload('annotation', params);
  postrequest('task/annotation', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createPolygonannotationTask = function(params, cb) {
  validatePayload('polygonannotation', params);
  postrequest('task/polygonannotation', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createLineannotationTask = function(params, cb) {
  validatePayload('lineannotation', params);
  postrequest('task/lineannotation', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createDatacollectionTask = function(params, cb) {
  validatePayload('datacollection', params);
  postrequest('task/datacollection', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

ScaleClient.prototype.createAudiotranscriptionTask = function(params, cb) {
  validatePayload('audiotranscription', params);
  postrequest('task/audiotranscription', this.apiKey, params, (err, json) => {
    if(cb) cb(err, new Task(this, json));
  });
};

/**
 * A task object, containing task information.
 * @namespace Task
 */
function Task(client, json) {
  this.client = client;
  this.id = json['task_id'];
  Object.assign(this, json);
}

/**
 * Refreshes a task, updating its information..
 *
 * @method scaleapi.Task#refresh
 * @param {function} cb - callback called with (err, updatedTask)
 */
Task.prototype.refresh = function(cb) {
  this.client.fetchTask(this.id, task => {
    Object.assign(this, task);
    cb(this);
  });
};

/**
 * Cancels a task.
 *
 * @method scaleapi.Task#cancel
 * @param {function} cb - callback called with (err, canceledTask)
 */
Task.prototype.cancel = function(cb) {
  this.client.cancelTask(this.id, cb);
};

function getrequest(endpoint, apiKey, params, cb) {
  request.get({
    url: SCALE_ENDPOINT + endpoint,
    qs: params,
    json: true,
    auth: {
      user: apiKey,
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

function postrequest(endpoint, apiKey, payload, cb) {
  request.post({
    url: SCALE_ENDPOINT + endpoint, 
    json: payload,
    auth: {
      user: apiKey,
      pass: '',
      sendImmediately: true
    }
  }, function(error, response, body) {
    try {
      var err = null;
      if (error || response.statusCode != 200) {
        err = new ScaleException(body['error'], response.statusCode);
      }
      if (cb) cb(err, body);
    } catch (e) {
      if (cb) cb(e, body);
    }
  });
}

function ScaleException(message, errcode) {
  this.message = message;
  this.errcode = errcode;
}

function ScaleInvalidRequest(message) {
  ScaleException.call(this);
  this.message = message;
}
ScaleInvalidRequest.prototype = Object.create(ScaleException.prototype);


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
