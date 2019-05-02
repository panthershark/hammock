'use strict';

var test = require('tape');
var MockRequest = require('../index.js').Request;
var Cookies = require('cookies');
var PassThrough = require('readable-stream').PassThrough;

test('MockRequest: Create request with cookie', function (t) {
  t.plan(3);

  var req = new MockRequest({
    url: '/hello',
    cookies: {
      foo: 'bar',
      bar: 'baz'
    }
  });

  t.ok(req, 'Request was created');

  var cookies = new Cookies(req);
  var foo = cookies.get('foo');
  var bar = cookies.get('bar');

  t.equal(foo, 'bar', 'Cookie (foo) should return the original value.');
  t.equal(bar, 'baz', 'Cookie (bar) should return the original value.');
  t.end();
});

test('MockRequest: can create with cookie header', function (t) {
  t.plan(2);

  var req = new MockRequest({
    headers: {
      cookie: 's=foo'
    }
  });

  t.ok(req);
  t.equal(req.headers.cookie, 's=foo');

  t.end();
});

test('MockRequest: pipe to another stream', function (t) {
  t.plan(1);

  var test_string = 'qweqwe';
  var p = new PassThrough();

  p.on('data', function accumulate (d) {
    t.equal(d.toString(), test_string);
  });
  p.on('end', function assertTest () {
    t.end();
  });

  var req = new MockRequest({
    headers: {
      cookie: 's=foo'
    }
  });

  req.pipe(p);

  req.write(test_string);
  req.end();
});
