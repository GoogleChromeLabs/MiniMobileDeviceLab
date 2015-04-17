'use strict';

var jws = require('jws');
var fs = require('fs');
var request = require('request');

var GAPI = function(options, callback) {
	this.token = null;
	this.token_expires = null;

	this.iss = options.iss;
	this.scope = options.scope;
	this.sub = options.sub;
	this.prn = options.prn;

    if (options.keyFile) {
        var self = this;
        process.nextTick(function() {
            fs.readFile(options.keyFile, function(err, res) {
                if (err) { return callback(err); }
                self.key = res;
                callback();
            });
        });
    } else if (options.key) {
        this.key = options.key;
        process.nextTick(callback);
    } else {
        callback(new Error("Missing key, key or keyFile option must be provided!"));
    }
};

GAPI.prototype.getToken = function(callback) {
	if (this.token && this.token_expires && (new Date()).getTime() < this.token_expires * 1000) {
        callback(null, this.token);
    } else {
        this.getAccessToken(callback);
    }
};

GAPI.prototype.getAccessToken = function(callback) {
    var self = this;
    var iat = Math.floor(new Date().getTime() / 1000);

    var payload = {
        iss: this.iss,
        scope: this.scope,
        aud: 'https://accounts.google.com/o/oauth2/token',
        exp: iat + 3600,
        iat: iat
    };

	if(this.sub)
		payload.sub = this.sub;

	if(this.prn)
		payload.prn = this.prn;

    var signedJWT = jws.sign({
        header: {alg: 'RS256', typ: 'JWT'},
        payload: payload,
        secret: this.key
    });

    var post_options = {
        url: 'https://accounts.google.com/o/oauth2/token',
        method: 'POST',
        strictSSL: false,
        form: {
          'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          'assertion': signedJWT
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    request(post_options, function(error, response, body) {
      if(error){
        self.token = null;
        self.token_expires = null;
        callback(error, null);
      } else {
        try {
          var d = JSON.parse(body);
          if (d.error) {
            self.token = null;
            self.token_expires = null;
            callback(d.error, null);
          } else {
            self.token = d.access_token;
            self.token_expires = iat + 3600;
            callback(null, self.token);
          }
        } catch (e) {
          callback(e, null);
        }
      }
    });
};

module.exports = GAPI;
