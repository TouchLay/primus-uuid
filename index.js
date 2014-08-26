// keep request and spark in sync
var requests = {};

exports.server = function uuidServerPlugin(primus) {
  primus.on('connection', function uuidOnConnection(spark) {
    if (!spark || !spark.query || !spark.query.uuid) {
      spark.end(); // this shouldn't happen to valid clients
      return;
    }

    spark.primus_uuid = spark.query.uuid;
  });

  if (!primus.auth) {
    // only set this if the user hasn't already set an authorization handler
    primus.authorizeData = function authorizeData(auth) {
        if ('function' !== typeof auth) {
          throw new Error('Authorize only accepts functions');
        }

        if (auth.length < 2) {
          throw new Error('Authorize function requires more arguments');
        }

        this.authData = auth;
        return this;
    };

    primus.authorize(function (req, done) {
      // client plugin not enabled, no uuid sent
      if (!req || !req.query || !req.query.uuid) {
        return done({ statusCode: 400, message: 'invalid request (did you enable the uuid client plugin?)' });
      }

      // the chance of this happening is very very low on valid clients
      if (requests.hasOwnProperty(req.query.uuid)) {
        return done({ statusCode: 400, message: 'invalid request (uuid already exists)' });
      }

      req.primus_uuid = req.query.uuid;

      // call authorizeData handler to get data and assign it to the request
      if (typeof this.authData === 'function') {
        this.authData(req, function dataDone(err, data) {
          if (err) {
            return done(err);
          } else {
            requests[req.primus_uuid] = data;
            return done();
          }
        });
      }
    });

    primus.on('connection', function syncDataOnConnection(spark) {
      if (!spark || !spark.primus_uuid || !requests.hasOwnProperty(spark.primus_uuid)) {
        spark.end(); // this shouldn't happen to valid clients
        return;
      }

      // assign data from request to spark and delete it from temporary object
      spark.data = requests[spark.primus_uuid];
      delete requests[spark.primus_uuid];
    });
  }
};

exports.client = function uuidClientPlugin(primus) {
  function uuid4(a){
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid4);
  }

  primus.on('outgoing::url', function (options) {
    if (options.query) options.query += '&uuid=' + uuid4();
    else options.query = 'uuid=' + uuid4();
  });
};