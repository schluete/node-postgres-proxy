/**
 * simple postgresql proxy taking queries via HTTP, then returning
 * the result as a JSON object
 * (c) 2010 Axel Schlueter
 */

var sys = require('sys');

// install a default error handler for all execptions not caught otherwise
process.on('uncaughtException', function (err) {
  sys.puts('uncaught exception found: ' + err);
});

// then start the proxy itself
var proxy = require('./lib/node-postgres-proxy');
proxy.createProxy('./settings.json');
