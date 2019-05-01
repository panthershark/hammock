'use strict';

var test = require('tape');

var Buffer = require('buffer').Buffer;
var nock = require('nock');
var PassThrough = require('readable-stream').PassThrough;
var request = require('request');

var MockRequest = require('../index.js').Request;
var MockResponse = require('../index.js').Response;

test('nock should return response', function t(assert) {

    nock('http://localhost:5555')
        .post('/derp')
        .reply(200, '{a');

    request.post('http://localhost:5555/derp', onResponse);

    function onResponse(err, res, body) {
        assert.ifError(err, 'Unexpected error in resonse');
        assert.strictEqual('{a', String(body));
        assert.end();
    }
});

test('request should pipe data', function t(assert) {
    nock('http://localhost:5555')
        .post('/derp', '{a')
        .reply(200, '{b');

    var chunks = [];
    var p = new PassThrough();
    p.on('data', function accumulate(d) {
        chunks.push(d);
    });
    p.on('end', function assertTest() {
        var data = Buffer.concat(chunks);
        assert.strictEqual(String(data), '{b');
        assert.end();
    });

    request.post({
        url: 'http://localhost:5555/derp',
        body: '{a'
    }).pipe(p);
});

test('request should pipe through hammock req', function t(assert) {
    nock('http://localhost:5555')
        .post('/derp', '{a')
        .reply(200, '{b');

    var req = MockRequest({
        url: 'http://localhost:5555/derp',
        method: 'POST'
    });

    var chunks = [];
    var p = new PassThrough();
    p.on('data', function accumulate(d) {
        chunks.push(d);
    });
    p.on('end', function assertTest() {
        var data = Buffer.concat(chunks);
        assert.strictEqual(String(data), '{b');
        assert.end();
    });

    req.pipe(request.post('http://localhost:5555/derp'))
        .pipe(p);

    req.write('{a');
    req.end();
});

test('response should pipe through hammock res', function t(assert) {
    nock('http://localhost:5555', {
        reqHeaders: {
            'x-test-request': 'RequestValue'
        }
    }).post('/derp', '{a')
    .reply(200, '{b', {'x-test-response': 'ResponseValue'});

    var req = MockRequest({
        url: 'http://localhost:5555/derp',
        method: 'POST',
        headers: {
            'x-test-request': 'RequestValue'
        }
    });
    var res = MockResponse(function onRes(err, response) {
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
