/**
 * simple postgresql proxy taking queries via HTTP, then returning
 * the result as a JSON object
 */

var sys = require('sys');
var fs = require('fs');
var http = require('http');
var url = require('url');

require.paths.unshift(__dirname + '/../lib/node-elf-logger/lib/');
var elf = require("elf-logger");

var pg = require(__dirname + '/../lib/node-postgres/lib');
pg.defaults.poolSize = 10;


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
  elf.createLogger(server, {
    'stream': process.stdout
  });
};

// called to handle a single HTTP request
ProxyServer.prototype.handleRequest = function (req, resp) {
  // collect the parts of the POST query message 
  var self = this, query = '';
  req.on('data', function (data) {
    query += data;
  });

  // then execute the query on the database
  req.on('end', function () {
    //sys.puts('executing query: ' + query);
    self.databaseConnection(req, function(err, client) {
      if(err)
        return sendError(resp, err);
      client.query(query, function (err, rs) {
        if(err) {
          client.query('rollback');
          sendError(resp, err.message);
        }
        else {
          client.query('commit');
          rs.success = true;
          resp.writeHead(200, {'Content-Type': 'application/json; encoding=utf-8'});
          resp.end(sys.inspect(rs));
        }
      });
    });

  });
};

// get the matching database connection for the request, either from
// the connection pool or create a new connection if none was found
ProxyServer.prototype.databaseConnection = function (req, callback) {
  // do we have a configuration for this database?
  var path = url.parse(req.url).pathname;
  var dbName = path.split('/').pop();
  if(!(dbName in this.config['databases']))
    return callback('configuration for database "' + dbName + '" does not exist');

  // get a database connection from the pool and execute the query
  var credentials = this.config['databases'][dbName];
  pg.connect('pg://comics:comics@localhost:5432/comics', callback);
};

// helper function, create an error message for the caller
function sendError(resp, error) {
  resp.writeHead(404, {'Content-Type': 'application/json; encoding=utf-8'});
  resp.end(sys.inspect({'success': false,
                        'error': error}));
}
