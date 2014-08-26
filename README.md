# primus-uuid
_uuid and authorization plugin for primus_

## Example
Because code says more than a thousand words (at least sometimes)...

```javascript
primus.use('uuid', require('primus-uuid'));

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
```

Run `node example.js` to test this code. (don't forget to `npm install primus ws` first)

Example output:
```
> node example.js
go to http://localhost:1337 to see the example in action
req uuid 308540f6-b387-4d97-9e5a-8ba4e26ba5b9
spark data test
spark uuid 308540f6-b387-4d97-9e5a-8ba4e26ba5b9
```