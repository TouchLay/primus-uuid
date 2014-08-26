/*jslint node: true*/
"use strict";

// core dependencies
var http   = require('http'),
    fs     = require('fs');

// create the http server
var server = http.createServer(function requestHandler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  fs.createReadStream(__dirname + '/example.html').pipe(res);
});
server.listen(1337, function() {
  console.log('go to http://localhost:1337 to see the example in action');
});

// primus
var Primus = require('primus'),
    primus = new Primus(server);

// example from README.md
primus.use('uuid', require('./index'));

// use authorizeData instead of authorize
// note that done(err) is done(err, data) here
primus.authorizeData(function authorizeData(req, done) {
  // done('error'); // errors can be thrown via a string or an object (just like in primus.authorize)

  console.log('req uuid', req.primus_uuid);

  done(null, 'test'); // this throws no error, but sends data 'test', which will be stored in the spark later
});

primus.on('connection', function onConnection(spark) {
  console.log('spark data', spark.data); // this should output 'test', the data we entered during authorization

  console.log('spark uuid', spark.primus_uuid); // additionally, every spark has a uuid now, that equals req.uuid in authorizationData (or req.query.uuid if you want to use vanilla primus authorization)
});