var events = require('events');
var util = require('util');
var http = require('http');
var Buffer = require('buffer').Buffer;

/**
 * Mock response object for receiving content without a server.
 **/
var MockResponse = function (callback) {
  if (!(this instanceof MockResponse)) {
    return new MockResponse(callback);
  }

  events.EventEmitter.call(this);

  this.buffer = [];
  this.statusCode = 200;
  this._headers = {};
  this.on('data', function (chunk) {
    this.buffer.push(chunk);
  });
  this.on('pipe', function (src) {
    var buffer = this.buffer;

    src.on('data', function (chunk) {
      buffer.push(chunk);
    })
  });
  this.on('close', function () {});

  if (callback) {
    var self = this;
    var cleanup = function () {
      self.removeListener('error', cleanup)
      self.removeListener('response', cleanup)

      callback.apply(this, arguments)
    }
    this.once('error', cleanup);
    this.once('response', cleanup);
  }

  // necessary for mocking a real request.
  this._headerNames = {};
  this._removedHeader = {};
};

util.inherits(MockResponse, events.EventEmitter);

MockResponse.prototype.write = function (str) {
  this.buffer.push(str);
};
MockResponse.prototype.writeHead = function (statusCode, headers) {
  var that = this;

  this.statusCode = statusCode;
  Object.keys(headers || {}).forEach(function (k) {
    that.setHeader(k, headers[k]);
  });
};
MockResponse.prototype.setHeader = function (name, value, clobber) {
  if (http.ServerResponse) {
    var ret = http.ServerResponse.prototype.setHeader.call(this, name, value, clobber);
    this.headers = this._headers;
    return ret;
  } else if (clobber || !this.headers.hasOwnProperty(name)) {
    this.headers[name] = value;
  } else {
    this.headers[name] += ',' + value;
  }
};
MockResponse.prototype.getHeader = function (name) {
  if (http.ServerResponse) {
    return http.ServerResponse.prototype.getHeader.call(this, name);
  } else {
    return this.headers[name];
  }
};
MockResponse.prototype.end = function (str) {
  if (this.finished) {
    return;
  }

  if (str) {
    this.buffer.push(str);
  }
  
  var body = this._buildBody();

  this.emit('close');
  this.emit('finish');
  this.emit('end', null, { // deprecate me
    statusCode: this.statusCode,
    body: body,
    headers: this._headers
  });
  this.emit('response', null, {
    statusCode: this.statusCode,
    body: body,
    headers: this._headers
  });
  this.finished = true

  // Cleanup any listeners that are 'hanging' around.
  this.removeAllListeners();
};

MockResponse.prototype._buildBody = function _buildBody() {
  if (this.buffer.length === 1) {
    return this.buffer[0];
  }

  var isBuffers = true;
  for (var i = 0; i < this.buffer.length; i++) {
    if (!Buffer.isBuffer(this.buffer[i])) {
      isBuffers = false;
    }
  }

  if (!isBuffers) {
    return this.buffer.join('');
  }

  return Buffer.concat(this.buffer);
};

module.exports = MockResponse;
