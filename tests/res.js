var test = require('tape');
var MockRequest = require('../index.js').Request;
var MockResponse = require('../index.js').Response;

var domain = require('domain');

test('error in response finish handler', function(t) {

  var errmessage = 'error in async'

  var dom = domain.create();
  dom.on('error',function(err){
    t.equal(err.message,errmessage,'the correct error message should be recieved');
    t.end();
  })

  var res = new MockResponse();  

  res.on('finish', function() {
    var body = res.buffer.join('');
    t.equal(res.statusCode, 200, 'Should return 200');
    t.ok(body, 'Should return content');

    throw new Error(errmessage)

    t.notOk(true,'this should never be reached');
  });

  dom.run(function(){
    try{
      res.statusCode = 200;
      res.end('done!');  
    }
    catch(e){
      t.notOk(e,'the exception should not reach here');
    }
  });
});