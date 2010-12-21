
var sys = require('sys');

/*
process.on('uncaughtException', function (err) {
  sys.puts('uncaught exception found: ' + err);
});
*/

var proxy = require('./lib/node-postgres-proxy');
proxy.createProxy('./settings.json');


