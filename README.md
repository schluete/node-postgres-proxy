node-postgres-proxy - a simple HTTP proxy for PostgreSQL in node.js
===================================================================

* the proxy was developed with node v0.2.5, download it from http://nodejs.org/
* to use the proxy you have to install all required dependencies via `make dependencies`
* copy `settings.json.sample` to `settings.json`, then edit the configuration of the proxy.
  You should at least configure one database, because without a database configuration
  the proxy isn't exactly useful :)
* configure some usernames and passwords to allow access to the server. The credentials
  must be send by the caller via HTTP BASIC AUTH.
* you could also provide some HMAC authentication secrets in the `settings.json` so that
  no plaintext passwords have to be send via BASIC AUTH. To generate the HMAC key for a
  request the caller has to compute the HMAC SHA1 digest from the request URL and one of
  the preconfigured secrets. The digest must then be send in the 'x-sig' HTTP request header.
* each configured database is available under its own endpoint URL, i.e. the database
  `foobar` will be accessible under `http://localhost:7070/sql/foobar`.
* to execute a query send a POST request to the proxy:

      curl -u "top:secret" -X POST --data "select * from persons" http://localhost:7070/node
      { 'success': true,
        'rows': [ { 'id': 1, 'name': 'Pierre Niemans' },
                  { 'id': 2, 'name': 'Max Kerkerian' },
                  { 'id': 3, 'name': 'Fanny Ferreira' }
                ]}

* the request returns the result as a JSON-formatted message. If the query was successful
  the field `success` will contain the boolean value `true`. In case of
  an error `success` will be `false` and the field `error` contains a textual
  error message.
* the return field `rows` contains the queried rows, if any.
