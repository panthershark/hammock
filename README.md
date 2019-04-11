# hammock

Node.js mock / polyfill http object library for http req / res.  

# Motivation

Polyfill req / res for testing w/o http or for code generation from an existing site. Since the purpose of this lib is mock req/res for testing, you probably want this as a dev dependency. I think I've used it in a production app for something like SSR or something, but it was unusual!!! 

# Install - Node 10+
Node 8 and Node 10 have some incompatible differences so only use the latest version for node 10. 

```
npm install hammock --dev

OR 

yarn add hammock --dev
```

# Install - Node 8 
Use v2 for Node 8

```
npm install hammock@v2.2.0  --dev

OR 

yarn add hammock@v2.2.0  --dev
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
