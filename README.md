# hammock.  [![Build Status](https://travis-ci.org/doanythingfordethklok/hammock.svg?branch=master)](https://travis-ci.org/doanythingfordethklok/hammock)

Node.js mock / polyfill http object library for http req / res.  

# Motivation

Polyfill req / res for testing w/o http or for code generation from an existing site. Since the purpose of this lib is mock req/res for testing, you probably want this as a dev dependency. I think I've used it in a production app for something like SSR or something, but it was unusual!!! 

# Install Node (0.10+)
This includes new releases (e.g. 0.10, 0.11, 0.12, iojs, 4, 5, 6, 7, 8, 9, 10, 11)

```
npm install hammock --save-dev

OR 

yarn add hammock --dev
```

# Install - Node (0.8 compatibility)

Hammock v3 breaks backwards compatibility for node 0.8 which
will not affect the vast majority of users. For those still
using 0.8, use major version 2.

```
npm install hammock@^2.2.0 --save-dev

OR 

yarn add hammock@v2.2.0 --dev
```


# Example


```js
/* Should consider migrating to a factory so that people don't have to guess whether to use new or not */
var MockRequest = require('hammock').Request,
    MockResponse = require('hammock').Response;

/* Most This is most helpful for GET requests.  In future, it would be nice to polyfill body parsing events. */
var req = new MockRequest({
        url: '/foo',
        headers: { host: 'localhost', bar: 'baz' },
        method: 'GET'
    }),
    res = new MockResponse();

res.on('end', function(err, data) {
     console.log(data.statusCode);
     console.log(util.inspect(data.headers));
     console.log(data.body);
});

/* Using pipeline-router / director syntax here, but this should be simple with express. */
var router = RouterFactory.create({ /* options */ });
router.dispatch(req, res);

```
