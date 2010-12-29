node-postgres-proxy - a simple HTTP proxy for PostgreSQL in node.js
===================================================================


Installation and configuration
------------------------------

* the proxy was developed with node v0.2.5, download it from http://nodejs.org/
* to use the proxy you have to install all required dependencies via `make dependencies`
* copy `settings.json.sample` to `settings.json`, then edit the configuration of the proxy.
  You should at least configure one database, because without a database configuration
  the proxy isn't exactly useful :)
* you can preconfigure headers to be included in the HTTP response to a query, e.g. a
  `Server`-header or `Cache-Control` to modify the caching behaviour of proxy clients.
  Currently it is not possible to configure dynamic headers, e.g. a timestamp or a value
  based on the incoming request.
  

Authentication
--------------

* configure some usernames and passwords to allow access to the server. The credentials
  must be send by the caller via HTTP BASIC AUTH.
* you could also provide some HMAC authentication secrets in the `settings.json` so that
  no plaintext passwords have to be send via BASIC AUTH. To generate the HMAC key for a
  request the caller has to compute the HMAC SHA1 digest from the request URL and one of
  the preconfigured secrets. The digest must then be send in the 'x-sig' HTTP request header.


Querying a database
-------------------
  
* each configured database is available under its own endpoint URL, i.e. the database
  `foobar` will be accessible under `http://localhost:7070/[action]/foobar`. The `action`
  part of the path can either be `sql` or `json`, depending on the query format.
* to execute a `sql` action query send SQL command via a POST request to the proxy:
  <code><pre>
  curl -u "top:secret" -X POST --data "select * from persons" http://localhost:7070/sql/node
  { 'success': true,
    'rows': [ { 'id': 1, 'name': 'Pierre Niemans' },
              { 'id': 2, 'name': 'Max Kerkerian' },
              { 'id': 3, 'name': 'Fanny Ferreira' }
            ]}
  </pre></code>
* you can also send a JSON formatted query to the `json` action. The JSON format supports
  multiple queries in a single request. Each JSON request is a combined insert/update SQL
  request (something like http://en.wikipedia.org/wiki/Upsert). The proxy will check if a
  row with the given conditions exists and update it. If it doesn't exist an update SQL
  query will be generated:
  <code><pre>
  curl -u "top:secret"
       -X POST --data '{"table": "persons",
                        "data": [{"conditions": {"id": 6, "age": 16},
                                  "values": {"name": "Judith Hérault"}},
                                 {"conditions": {"id": 5, "age": 7},
                                  "values": {"name": "Rémy Caillois", "age": 20}}]}'
       http://localhost:7070/json/node
  { 'success': true }
  </pre></code>
  * the request returns the result as a JSON-formatted message. If the query was successful
  the field `success` will contain the boolean value `true`. In case of
  an error `success` will be `false` and the field `error` contains a textual
  error message.
* the return field `rows` contains the queried rows, if any.


Unit testing
------------

* there a few unit tests via the http://vowsjs.org unittesting framework. To execute the
  `tests` make target you have to install vows:

      $ curl http://npmjs.org/install.sh | sh
      $ npm install vows 
