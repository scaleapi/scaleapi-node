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

  if (connectionParams === null) {
    throw new ScaleException('no connection parameters');
  }
  if (connectionParams.apikey === null) {
    throw new ScaleException('missing api key');
  }
  this.apikey = connectionParams.apikey;
}

ScaleClient.prototype.fetch_task = (task_id, cb) => {
  getrequest('task/' + task_id, this.apikey, {}, json => {
    cb(new Task(this, json));
  });
};

ScaleClient.prototype.cancel_task = (task_id, cb) => {
  getrequest('task/' + task_id + '/cancel', this.apikey, {}, json => {
    cb(new Task(this, json));
  });
};

ScaleClient.prototype.tasks = (params, cb) => {
  var allowed_kwargs = ['start_time', 'end_time', 'status', 'type', 'limit', 'offset'];
  Object.keys(params).forEach(property => {
    if (allowed_kwargs.indexOf(property) < 0) {
      throw new ScaleInvalidRequest('Illegal parameter ' + property +
          ' for ScaleClient.tasks');
    }
  });
  getrequest('tasks', this.apikey, params, json => {
    var docs = json['docs'];
    var tasks = docs.map(json => new Task(this, json));
    if (cb !== null) cb(tasks);
  });
};

ScaleClient.prototype.create_categorization_task = (params, cb) => {
  validatePayload('categorization', params);
  postrequest('task/categorize', this.apikey, params, json => {
    cb(new Task(this, json));
  });
};

ScaleClient.prototype.create_transcription_task = (params, cb) => {
  validatePayload('transcription', params);
  postrequest('task/transcription', this.apikey, params, json => {
    cb(new Task(this, json));
  });
};

ScaleClient.prototype.create_phoecall_task = (params, cb) => {
  validatePayload('phonecall', params);
  postrequest('task/phonecall', this.apikey, params, json => {
    cb(new Task(this, json));
  });
};

ScaleClient.prototype.create_comparison_task = (params, cb) => {
  validatePayload('comparison', params);
  postrequest('task/comparison', this.apikey, params, json => {
    cb(new Task(this, json));
  });
};

ScaleClient.prototype.create_annotation_task = (params, cb) => {
  validatePayload('annotation', params);
  postrequest('task/annotation', this.apikey, params, json => {
    cb(new Task(this, json));
  });
};

ScaleClient.prototype.create_datacollection_task = (params, cb) => {
  validatePayload('datacollection', params);
  postrequest('task/datacollection', this.apikey, params, json => {
    cb(new Task(this, json));
  });
};

ScaleClient.prototype.create_audiotranscription_task = (params, cb) => {
  validatePayload('audiotranscription', params);
  postrequest('task/audiotranscription', this.apikey, params, json => {
    cb(new Task(this, json));
  });
};

function Task(client, json) {
  this.client = client;
  this.id = json['task_id'];
  Object.assign(this, json);
}

Task.prototype.refresh = () => {
  this.client.fetch_task(this.id, task => {
    Object.assign(this, task);
  });
};

Task.prototype.cancel = () => {
  this.client.cancel_task(this.id);
};

function getrequest(endpoint, apikey, params, cb) {
  request.get({url: SCALE_ENDPOINT + endpoint, qs: params, json: true, auth: {
    user: apikey,
    pass: '',
    sendImmediately: true
  }}
  , function(error, response, body) {
    if (error || response.statusCode != 200) {
      if (cb !== null) {
        cb(body);
      }
    } else {
      throw new ScaleException(body['error'], response.statusCode);
    }
  });
}

function postrequest(endpoint, apikey, payload, cb) {
  request.post(SCALE_ENDPOINT + endpoint, {
    auth: {
      user: apikey,
      pass: '',
      sendImmediately: true
    },
    form: payload
  }, function(error, response, body) {
    if (error || response.statusCode != 200) {
      if (cb !== null) {
        cb(body);
      }
    } else {
      throw new ScaleException(body['error'], response.statusCode);
    }
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

function validatePayload(task_type, kwargs) {
  Object.keys(kwargs).forEach(property => {
    if (DEFAULT_FIELDS.indexOf(property) < 0 &&
        ALLOWED_FIELDS[task_type].indexOf(property) < 0) {
      throw new ScaleInvalidRequest('Illegal parameter ' + property +
          ' for task type ' + task_type);
    }
  });
}

module.exports = {ScaleClient: ScaleClient};
