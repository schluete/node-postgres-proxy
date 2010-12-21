
var sys = require('sys');
var proxy = require('./lib/node-postgres-proxy');

process.on('uncaughtException', function (err) {
  sys.puts('uncaught exception found: ' + err);
});

proxy.createProxy('./settings.json');


// require.paths.unshift('./lib/postgres-js/lib/');
// var pg = require('postgres-pure');
// pg.DEBUG = 1;

// var query = 'drop table foobar';
// var db=new pg.connect("pgsql://schluete:pyrrha@localhost:5432/schluete");
// db.on('error', function(err) {
//         sys.puts("-------> debug 3000: "+err);
//         });

// sys.puts("------------> debug 100");
// db.query('select * from users where id=1', function (data) {
//            sys.puts(sys.inspect(data));
//          });

// sys.puts("------------> debug 110");
// db.query('select * from currencies where id=1889', function (data) {
//            sys.puts(sys.inspect(data));
//          });

// sys.puts("------------> debug 120");
