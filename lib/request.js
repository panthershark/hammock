var Cookies = require('cookies');
var MockResponse = require('./response.js');
var _ = require('lodash');
var http = require('http');

/**
* Mock request object for sending to the router without needing a server.
**/
var MockRequest = function(options) {
  this.body = '';
  this.url = options.url || '/';
  this.headers = this._headers = options.headers || {};
  this.method = options.method || 'GET';
  this.connection = {};

  var cookieBuffer = [];

  _.each(options.cookies, function(val, key) {
    cookieBuffer.push(key + '=' + val);
  });

  this.setHeader('cookie', cookieBuffer.join(';'));
};

MockRequest.prototype.setHeader = function(name, value, clobber) {
  var ret = http.ClientRequest.prototype.setHeader.call(this, name, value, clobber);
  this.headers = this._headers;
  return ret;
};

MockRequest.prototype.getHeader = function(name) {
  return http.ClientRequest.prototype.getHeader.call(this, name);
};
module.exports = MockRequest;