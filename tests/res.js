'use strict';

var test = require('tape');
var MockResponse = require('../index.js').Response;
var PassThrough = require('readable-stream').PassThrough;

test('MockResponse: can write to response', function t (assert) {
  assert.plan(1); // ensure onResponse is not called multiple times or some other weird condition.
  var res = new MockResponse(onResponse);

  res.write('foo');
  res.write('bar');
  res.end();

  function onResponse (err, resp) {
    assert.equal(resp.body, 'foobar');
    assert.end();
  }
});

test('MockResponse: can write buffers to response', function t (assert) {
  assert.plan(1); // ensure onResponse is not called multiple times or some other weird condition.
  var res = new MockResponse(onResponse);

  res.write('foo');
  res.write(new Buffer('bar'));
  res.end();

  function onResponse (err, resp) {
    assert.equal(resp.body, 'foobar');
    assert.end();
  }
});

test('MockResponse: can write buffer to end()', function t (assert) {
  assert.plan(1); // ensure onResponse is not called multiple times or some other weird condition.
  var res = new MockResponse(onResponse);

  res.end(new Buffer('foobar'));

  function onResponse (err, resp) {
    assert.equal(
      resp.body.toString('hex'), new Buffer('foobar').toString('hex')
    );
    assert.end();
  }
});

test('MockResponse: can write only buffers to response', function t (assert) {
  assert.plan(1); // ensure onResponse is not called multiple times or some other weird condition.
  var res = new MockResponse(onResponse);

  res.write(new Buffer('foo'));
  res.write(new Buffer('bar'));
  res.end();

  function onResponse (err, resp) {
    assert.equal(
      resp.body.toString('hex'), new Buffer('foobar').toString('hex')
    );
    assert.end();
  }
});

test('MockResponse: can write only buffers to response with pipe', function t (assert) {
  assert.plan(1); // ensure onResponse is not called multiple times or some other weird condition.
  var res = new MockResponse(onResponse);

  var stream = new PassThrough();

  stream.write(new Buffer('foo'));
  stream.write(new Buffer('bar'));
  stream.pipe(res);
  stream.end();

  function onResponse (err, resp) {
    assert.equal(
      resp.body.toString('hex'), new Buffer('foobar').toString('hex')
    );
    assert.end();
  }
});

test('MockResponse: can handle empty responses', function t (assert) {
  assert.plan(1); // ensure onResponse is not called multiple times or some other weird condition.
  var res = new MockResponse(onResponse);

  var stream = new PassThrough();

  stream.pipe(res);
  stream.end();

  function onResponse (err, resp) {
    assert.deepEqual(resp.body, '');
    assert.end();
  }
});

test('MockResponse: set headers', function t (assert) {
  assert.plan(2); // ensure onResponse is not called multiple times or some other weird condition.

  var res = new MockResponse(onResponse);

  res.setHeader('x-test', 'sdf');
  res.setHeader('x-test2', 'ertt');

  var stream = new PassThrough();

  stream.pipe(res);
  stream.end();

  function onResponse (err, resp) {
    assert.deepEqual(resp.headers['x-test'], 'sdf');
    assert.deepEqual(resp.headers['x-test2'], 'ertt');
    assert.end();
  }
});

test('MockResponse: pipe to res', function t (assert) {
  assert.plan(2);

  var res = MockResponse(function onRes (err, response) {
    assert.ifError(err);
    assert.strictEqual(String(response.body), '{b');
    assert.end();
  });

  var writer = new PassThrough();

  writer.pipe(res);
  writer.write('{b');
  writer.end();
});
