'use strict';

var test = require('tape');

var Buffer = require('buffer').Buffer;
var nock = require('nock');
var PassThrough = require('readable-stream').PassThrough;
var request = require('request');

var MockRequest = require('../index.js').Request;
var MockResponse = require('../index.js').Response;

test('Integration: MockRequest should pipe through request module', function t (assert) {
  nock('http://localhost:5555')
    .post('/derp', '{a')
    .reply(200, '{b');

  var req = MockRequest({
    url: 'http://localhost:5555/derp',
    method: 'POST'
  });

  var chunks = [];
  var p = new PassThrough();

  p.on('data', function accumulate (d) {
    chunks.push(d);
  });
  p.on('end', function assertTest () {
    var data = Buffer.concat(chunks);

    assert.strictEqual(String(data), '{b');
    assert.end();
  });

  req.pipe(request.post('http://localhost:5555/derp'))
    .pipe(p);

  req.write('{a');
  req.end();
});

test('Integration: response module should pipe to hammock res', function t (assert) {
  nock('http://localhost:5555', {
    reqHeaders: {
      'x-test-request': 'RequestValue'
    }
  }).post('/derp', '{a')
    .reply(200, '{b', { 'x-test-response': 'ResponseValue' });

  var req = MockRequest({
    url: 'http://localhost:5555/derp',
    method: 'POST',
    headers: {
      'x-test-request': 'RequestValue'
    }
  });
  var res = MockResponse(function onRes (err, response) {
    assert.ifError(err);
    assert.strictEqual(String(response.body), '{b');
    assert.deepEqual(response.headers, {
      'x-test-response': 'ResponseValue'
    });
    assert.end();
  });

  req.pipe(request.post('http://localhost:5555/derp'))
    .pipe(res);

  req.write('{a');
  req.end();
});
