var _ = require('lodash');
var events = require('events');
var util = require('util');
var http = require('http');

/**
* Mock response object for receiving content without a server.
**/
var MockResponse = function() {
    this.buffer = [];
    this.statusCode = null;
    this._headers = {};
    this.on('data', function(chunk) {
        this.buffer.push(chunk);
    });
    this.on('pipe', function(src) {
        var buffer = this.buffer;

        src.on('data', function(chunk){
            buffer.push(chunk);            
        })
    });
    this.on('close', function() {});
};

util.inherits(MockResponse, events.EventEmitter);

MockResponse.prototype.write = function(str) {
    this.buffer.push(str);
};
MockResponse.prototype.writeHead = function(statusCode, headers) {
    this.statusCode = statusCode;
    _.extend(this._headers, headers);
};
MockResponse.prototype.setHeader = function(name, value, clobber) {
  return http.ServerResponse.prototype.setHeader.call(this, name, value, clobber);
};
MockResponse.prototype.getHeader = function(name) {
  return http.ServerResponse.prototype.getHeader.call(this, name);
};
MockResponse.prototype.end = function(str) {
    this.buffer.push(str);
    this.emit('end', null, {
        statusCode: this.statusCode,
        body: this.buffer.join(''),
        headers: this._headers
    });
};

module.exports = MockResponse;
