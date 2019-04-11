var Cookies = require('cookies');
var url = require('url');
var http = require('http');
var util = require('util');
var PassThrough = require('readable-stream').PassThrough;
var _ = require('lodash');

// Some versions of node populate _headers while others
// populate a symbol key (node10+)
var outHeadersKey = readOutHeadersKey();

/**
 * Mock request object for sending to the router without needing a server.
 **/
var MockRequest = function (options) {
  if (!(this instanceof MockRequest)) {
    return new MockRequest(options);
  }

  PassThrough.call(this, options);

  this.body = '';
  this.httpVersion = '1.1';
  this.url = options.url || '/';
  this.query = url.parse(this.url, true).query;
  this[outHeadersKey] = null;
  this.headers = this._headers = {};

  // necessary for mocking a real request.
  this._headerNames = {};
  this._removedHeader = {};

  // setHeader now applies toLowerCase the names to mirror native node behaviour
  var self = this;
  _.each(options.headers, function (v, k) {
    if (v !== undefined) {
      self.setHeader(k, v);
    }
  });

  this.setHeader('transfer-encoding', 'chunked');

  this.method = options.method || 'GET';
  this.connection = this.socket = {};
  // this.buffer = [];

  if (options.cookies && !this.getHeader('cookie')) {
    var cookieBuffer = [];

    _.forEach(_.keys(options.cookies), function (key) {
      cookieBuffer.push(key + '=' + options.cookies[key]);
    });

    this.setHeader('cookie', cookieBuffer.join(';'));
  }
};

util.inherits(MockRequest, PassThrough);


MockRequest.prototype.setHeader = function (name, value, clobber) {
  if (http.ClientRequest) {
    var ret = http.ClientRequest.prototype.setHeader.call(this, name, value, clobber);
    if (http.ClientRequest.prototype.getHeaders) {
      this.headers = http.ClientRequest.prototype.getHeaders.call(this);
    } else {
      this.headers = this[outHeadersKey];
    }
    return ret;
  } else if (clobber || !this.headers.hasOwnProperty(name)) {
    this.headers[name.toLowerCase()] = value;
  } else {
    this.headers[name.toLowerCase()] += ',' + value;
  }
};

MockRequest.prototype.getHeader = function (name) {
  if (http.ClientRequest) {
    return http.ClientRequest.prototype.getHeader.call(this, name);
  } else {
    return this.headers[name];
  }
};

function readOutHeadersKey() {
  if (http.ClientRequest && Object.getOwnPropertySymbols) {
    var x = {};
    try {
      http.ClientRequest.apply(x);
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

module.exports = MockRequest;
