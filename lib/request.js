
/**
* Mock request object for sending to the router without needing a server.
**/
var MockRequest = function(options) {
    this.body = '';
    this.url = options.url || '/';
    this.headers = options.headers;
    this.method = options.method || 'GET';
};

module.exports = MockRequest;