/**
 * simple postgresql proxy taking queries via HTTP, then returning
 * the result as a JSON object
 */

var sys = require('sys');
var fs = require('fs');
var http = require('http');
var url = require('url');

require.paths.unshift('./lib/postgres-js/lib/');
var pg = require('postgres-pure');


// create and return a new proxy instance
exports.createProxy = function (configFilename) {
  return new ProxyServer(configFilename);
};

// proxy class definition
function ProxyServer(configFilename) {
  this.configFile = configFilename;
  this.config = {};
  this.connectionPool = {};

  this.readConfigurationAndStartServer();
}

// parse the configuration file and initialize the HTTP server
ProxyServer.prototype.readConfigurationAndStartServer = function () {
  var inst = this;
  fs.readFile(this.configFile, function (err, data) {
    if(err) throw err;
    inst.config = JSON.parse(data);
    inst.startServer();
  });
};

// initialize the HTTP server, then start it
ProxyServer.prototype.startServer = function () {
  var host = this.config.host || 'localhost';
  var port = parseInt(this.config.port || '7070');

  var inst = this;
  var server = http.createServer(function (req, resp) {
    inst.handleRequest(req, resp);
  });
  server.listen(port, host);
  sys.puts('server was started on ' + host + ':' + port);
};

// called to handle a single HTTP request
ProxyServer.prototype.handleRequest = function (req, resp) {
  var db = this.getDatabaseConnection(req);

  var query = '';
  req.on('data', function (data) {
    query += data;
  });
  req.on('end', function () {
    sys.puts('executing query: ' + query);

    // // install an error handler for this request
    // db.on('error', function(error) {
    // });

    // // then fire the request and process the result
    // db.query(query, function (data) {
    //   resp.writeHead(200, {'Content-Type': 'text/plain'});
    //   resp.end(sys.inspect(data));
    //   db.tx().commit();
    // });
    // db.close();

    // transaction handling doesn't work with the HEAD of postgres-js 
    db.transaction(function (tx) {
      tx.begin();
      tx.query(query, function (err, rs) {
        if(err) {
          resp.writeHead(404, {'Content-Type': 'text/plain'});
          resp.end(error);
        }
        else {
          resp.writeHead(200, {'Content-Type': 'text/plain'});
          resp.end(sys.inspect(rs));
        }
        tx.commit();
      });
      //tx.rollback();
      //tx.close();
    });
  });
};

// get the matching database connection for the request, either from
// the connection pool or create a new connection if none was found
ProxyServer.prototype.getDatabaseConnection = function (req) {
  var path = url.parse(req.url).pathname;
  var dbName = path.split('/').pop();

  // do we have the database in the connection pool?
  if(dbName in this.connectionPool)
    return this.connectionPool[dbName];

  // nope, create a new connection
  if(!(dbName in this.config['databases']))
    throw "database '" + dbName + "' wasn't configured!";
  var credentials = this.config['databases'][dbName];
  var db=new pg.connect("pgsql://" + credentials);
  this.connectionPool[dbName] = db;
  return db;
};
