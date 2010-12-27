/**
 * some generic helper functions for the PostgreSQL proxy
 * (c) 2010 Axel Schlueter
 */

var sys = require('sys'),
    _ = require(__dirname + '/../lib/underscore/underscore.js');


// helper function, deconstruct a base64 auth string into username and password
exports.decodeBase64Authorization = function(str) {
  if(!str)
    return null;
  var value;
  if(value = str.match("^Basic\\s([A-Za-z0-9+/=]+)$")) {
    var auth = (new Buffer(value[1] || "", "base64")).toString("ascii");
    return {
      username : auth.slice(0, auth.indexOf(':')),
      password : auth.slice(auth.indexOf(':') + 1, auth.length)
    };
  }
  else
    return null;
};

// helper function, create an error message for the caller
exports.sendError = function(resp, error, status) {
  console.log('#Error: ' + error + ': ' + status);
  resp.writeHead(status || 500, {'Content-Type': 'application/json; encoding=utf-8'});
  resp.end(JSON.stringify({'success': false,
                           'error': error}));
}

// helper function, try to parse the given data as a JSON object, then return it
// as a Javascript object. If the input is invalid, `undefined` will returned.
exports.parseJSON = function(data) {
  try {
    return JSON.parse(data);
  }
  catch(error) {
    return undefined;
  }
}

// helper function, convert the given query object from the upsert
// command into an SQL update 
exports.buildSqlInsert = function(table, query) {
  var fields = [], values = [],
      mapper = function(value, field) {
        fields.push(field);
        values.push("'" + value + "'");
      };

  _.each(query.conditions, mapper);
  _.each(query.values, mapper);
  return 'insert into '
    + table
    + ' ('
    + fields.join(', ')
    + ') values ('
    + values.join(',')
    + ')';
}

// convert the given query object from the upsert command into an SQL update 
exports.buildSqlUpdate = function(table, query) {
  var conditions = _.map(query.conditions, field_value_mapper).join(' and '),
      values = _.map(query.values, field_value_mapper).join(' , ');
  return 'update "' + table + '" set ' + values + ' where ' +conditions;
}

// build a SQL count(*) statement for the given table and conditions
exports.execSqlCount = function(client, table, query, callback) {
  var conditions = _.map(query.conditions, field_value_mapper).join(' and '),
      query = 'select count(*) from "' + table + '" where ' + conditions;
  client.query(query, function(err, rs) {
    var rowCnt = rs.rows[0].count;
    callback(rowCnt);
  });
}

function field_value_mapper(value, field) {
  return field + "='" + value + "'";
}
