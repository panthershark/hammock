var _ = require('lodash'),
    events = require('events'),
    util = require('util');

/**
* Mock response object for receiving content without a server.
**/
var MockResponse = function() {
    this.buffer = [];
    this.statusCode = null;
    this.headers = {};
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
    _.extend(this.headers, headers);
};
MockResponse.prototype.setHeader = function(name, value) {
    this.headers[name] = value;
};
MockResponse.prototype.getHeader = function(name) {
    return this.headers[name];
};
MockResponse.prototype.end = function(str) {
    this.buffer.push(str);
    this.emit('end', null, {
        statusCode: this.statusCode,
        body: this.buffer.join(''),
        headers: this.headers
    });
};

module.exports = MockResponse;
