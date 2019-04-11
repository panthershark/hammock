var events = require('events');
var util = require('util');
var http = require('http');
var Buffer = require('buffer').Buffer;

// Some versions of node populate _headers while others
// populate a symbol key (node10+)
var outHeadersKey = readOutHeadersKey();

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
  this[outHeadersKey] = null;
  this._headers = {};

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
    if (http.ServerResponse.prototype.getHeaders) {
      this.headers = http.ServerResponse.prototype.getHeaders.call(this);
    } else {
      this.headers = this[outHeadersKey];
    }
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
  var headers;

  if (http.ServerResponse.prototype.getHeaders) {
    headers = http.ServerResponse.prototype.getHeaders.call(this);
  } else {
    headers = this[outHeadersKey];
  }

  this.emit('close');
  this.emit('finish');
  this.emit('end', null, { // deprecate me
    statusCode: this.statusCode,
    body: body,
    headers: headers
  });
  this.emit('response', null, {
    statusCode: this.statusCode,
    body: body,
    headers: headers
  });
  this.finished = true

  // Cleanup any listeners that are 'hanging' around.
  this.removeAllListeners();
};

MockResponse.prototype._buildBody = function _buildBody() {
  if (this.buffer.length === 0) {
    return '';
  }
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

function readOutHeadersKey() {
  if (http.ServerResponse && Object.getOwnPropertySymbols) {
    var x = {};
    try {
      http.ServerResponse.apply(x);
    } catch (e) {
      // This will invariably throw
    }
    var symbols = Object.getOwnPropertySymbols(x);
    for (var i = 0; i < symbols.length; i++) {
      if (symbols[i].toString() == 'Symbol(outHeadersKey)') {
        return symbols[i];
      }
    }
  }
  return '_headers';
}


module.exports = MockResponse;
