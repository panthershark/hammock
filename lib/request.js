var Cookies = require('cookies');
var MockResponse = require('./response.js');
var http = require('http');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
* Mock request object for sending to the router without needing a server.
**/
var MockRequest = function(options) {
  EventEmitter.call(this, options);

  this.body =  options.body || '';
  this.url = options.url || '/';
  this.headers = this._headers = options.headers || {};
  this.headers['content-length'] = this.body.length;
  this.headers['transfer-coding'] = 'chunked';

  this.method = options.method || 'GET';
  this.connection = {};
  // this.buffer = [];

  var cookieBuffer = [];

  Object.keys(options.cookies || {}).forEach(function(key) {
    cookieBuffer.push(key + '=' + options.cookies[key]);
  });

  this.setHeader('cookie', cookieBuffer.join(';'));
};

util.inherits(MockRequest, EventEmitter);


MockRequest.prototype.setHeader = function(name, value, clobber) {
  var ret = http.ClientRequest.prototype.setHeader.call(this, name, value, clobber);
  this.headers = this._headers;
  return ret;
};

MockRequest.prototype.getHeader = function(name) {
  return http.ClientRequest.prototype.getHeader.call(this, name);
};

MockRequest.prototype.pause = function() {};

MockRequest.prototype.resume = function() {};

MockRequest.prototype.end = function() {
  this.emit('data', this.body);
  this.emit('end');
};

module.exports = MockRequest;