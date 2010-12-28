/**
 * unit test suite for node-postgres-proxy
 */

var sys = require('sys'),
    http = require('http'),
    vows = require('vows'),
    assert = require('assert'),
    http = require('http'),
    crypto = require('crypto');

var proxy = require('./lib/node-postgres-proxy');
var helpers = require('./lib/helpers.js');

var utils = {
  mockServerResponse: function() {
    this.data = '';
    this.status = undefined;
    this.headers = undefined;

    this.writeHead = function(status, headers) {
      this.status = status;
      this.headers = sys.inspect(headers);
    };
    this.end = function(data) {
      this.data = data;
    };
  },

  post: function(hostname, port, path, credentials, data, callback) {
    var client = http.createClient(port, hostname);
    var auth = 'Basic ' + new Buffer(credentials || 'top:secret').toString('base64');
    var headers = {'Host': hostname + ':' + port,
                   'Authorization': auth,
                   'Content-Length': data.length};
    var req = client.request('POST', path, headers);
    req.write(data, 'utf8');
    req.end();
    req.on('response', function(resp) {
      var statusCode = resp.statusCode;
      var headers = JSON.stringify(resp.headers);
      var postData = '';
      resp.setEncoding('utf8');
      resp.on('data', function(chunk) { postData += chunk; });
      resp.on('end', function() {
        callback(statusCode, headers, postData);
      });
    });
  },

  assertStatus: function(expectedCode) {
    return function(statusCode, dummy) {
      assert.equal(statusCode, expectedCode);
    };
  }
};

vows.describe('helper functions').addBatch({

  // ---------------------------------------------------------------------------------------------
  'decodeBase64Authorization()': {
    'without a string': {
      topic: helpers.decodeBase64Authorization(),
      'generates a null result': function(topic) {
        assert.isNull(topic);
      }
    },
    'with an empty': {
      topic: helpers.decodeBase64Authorization(''),
      'generates a null result': function(topic) {
        assert.isNull(topic);
      }
    },
    'with a valid auth header': {
      topic: helpers.decodeBase64Authorization('Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='),
      'decodes the credentials': function(topic) {
        assert.equal(topic.username, 'Aladdin');
        assert.equal(topic.password, 'open sesame');
      }
    }
  },

  // ---------------------------------------------------------------------------------------------
  'sendError()': {
    'without a status': {
      topic: function() {
        var resp=new utils.mockServerResponse();
        helpers.sendError(resp, 'msg');
        return resp;
      },
      'generates a 500 internal server error': function(topic) {
        assert.equal(topic.status, 500);
        assert.equal(topic.data, "{\"success\":false,\"error\":\"msg\"}");
      }
    },
    'with a 404 status': {
      topic: function() {
        var resp=new utils.mockServerResponse();
        helpers.sendError(resp, 'msg', 404);
        return resp;
      },
      'generates a 404 not found': function(topic) {
        assert.equal(topic.status, 404);
      }
    },
    'without a message': {
      topic: function() {
        var resp=new utils.mockServerResponse();
        helpers.sendError(resp);
        return resp;
      },
      'generates a placeholder 500 without a message': function(topic) {
        assert.equal(topic.status, 500);
        assert.equal(topic.data, "{\"success\":false}");
      }
    }
  },

  // ---------------------------------------------------------------------------------------------
  'parseJSON()': {
    'with undefined input': {
      topic: helpers.parseJSON(undefined),
      'returns undefined': function(topic) { assert.isUndefined(topic); }
    },
    'with non-textual (numeric) input': {
      topic: helpers.parseJSON(123),
      'returns a Javascript numeral': function(topic) { assert.equal(topic, 123); }
    },
    'with an empty string': {
      topic: helpers.parseJSON(''),
      'returns undefined': function(topic) { assert.isUndefined(topic); }
    },
    'with a JSON string': {
      topic: helpers.parseJSON('{"foo": "bar"}'),
      'returns undefined': function(topic) { assert.equal(topic.foo, 'bar'); }
    }
  },

  // ---------------------------------------------------------------------------------------------
  'buildSqlInsert()': {
    'with valid parameters': {
      topic: function() {
        var params = {conditions: {"id":2 },
                      values: {"name": "Judith Hérault"}};
        return helpers.buildSqlInsert('persons', params);
      },
      'generates a query': function(topic) {
        assert.equal(topic, "insert into persons (id, name) values ('2','Judith Hérault')");
      },
    },

    'without parameters': {
      topic: function() {
        try {
          return helpers.buildSqlInsert('persons');
        }
        catch(exc) {
          return exc;
        }
      },
      'fails with an exception': function(topic) {
        assert.equal(topic.message, "Cannot read property 'conditions' of undefined");
      }
    },

    'with empty parameters': {
      topic: function() {
        try {
          return helpers.buildSqlInsert('persons', {});
        }
        catch(exc) {
          return exc;
        }
      },
      'generates an empty statement': function(topic) {
        assert.equal(topic, '');
      }
    }
  },

  // ---------------------------------------------------------------------------------------------
  'buildSqlUpdate()': {
    'with valid parameters': {
      topic: function() {
        var params = {conditions: {"id":2 },
                      values: {"name": "Judith Hérault"}};
        return helpers.buildSqlUpdate('persons', params);
      },
      'generates a query': function(topic) {
        assert.equal(topic, "update \"persons\" set name='Judith Hérault' where id='2'");
      },
    },

    'without parameters': {
      topic: function() {
        try {
          return helpers.buildSqlUpdate('persons');
        }
        catch(exc) {
          return exc;
        }
      },
      'fails with an exception': function(topic) {
        assert.equal(topic.message, "Cannot read property 'conditions' of undefined");
      }
    },

    'with empty parameters': {
      topic: function() {
        try {
          return helpers.buildSqlUpdate('persons', {});
        }
        catch(exc) {
          return exc;
        }
      },
      'generates an empty statement': function(topic) {
        assert.equal(topic, '');
      }
    }
  },

  // ---------------------------------------------------------------------------------------------
  'the proxy': {
    'with configuration from file': {
      topic: function() {
        var self = this;
        proxy.createProxy('./tests.settings.json', function(server) {
          var query = 'select * from persons';
          utils.post('localhost', '7070', '/sql/node', 'top:secret', query,
                     function(statusCode, headers, postData) {
                       self.callback(statusCode, 'dummy');
                       server.close();
                     });
        });
      },
      'is valid': utils.assertStatus(200)
    }
  }
}).export(module);
