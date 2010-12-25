node-postgres-proxy - a simple HTTP proxy for PostgreSQL in node.js
===================================================================

* the proxy was developed with node v0.2.5, download it from http://nodejs.org/
* to use the proxy you have to install all required dependencies via `make dependencies`
* edit the configuration of the proxy in the file `settings.json`. Configure at
  least one database. Without a database configuration the proxy isn't very useful.
* configure some usernames and passwords to allow access to the server. The credentials
  must be send by the caller via HTTP BASIC AUTH.
* each configured database is available under its own endpoint URL, i.e. the database
  `foobar` will be accessible under `http://localhost:7070/foobar`.
* to execute a query send a POST request to the proxy:

   $ curl -u "top:secret" -X POST --data "select * from persons" http://localhost:7070/node
   { 'success': true,
     'rows': [ { 'id': 1, 'name': 'Pierre Niemans' },
               { 'id': 2, 'name': 'Max Kerkerian' },
               { 'id': 3, 'name': 'Fanny Ferreira' }
             ]
   }

* the request returns the result as a JSON-formatted message. If the query was successful
  the field `success` will contain the boolean value `true`. In case of
  an error `success` will be `false` and the field `error` contains a textual
  error message.
* the return field `rows` contains the queried rows, if any.
