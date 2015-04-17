'use strict';

var Firebase = require('firebase');
var https = require('https');
var urlParser = require('url');
var WebRequest = require('./../helper/WebRequest');

function OWPModel(fb) {
  var firebase = fb;

  this.getFirebase = function() {
    return firebase;
  };

  this.getResultValidExpiration = function() {
    return 60 * 60 * 1000;
  };
}

OWPModel.prototype.getManifestRegex = function() {
  // Adapted from Addy Osmanis Theme-Color Regex
  // https://github.com/addyosmani/regex-theme-color
  //<link rel="manifest" href="manifest.json">
  return /(\W|^)<link(.*?((rel=("|\')manifest("|\').*?(href=("|\')(.*?)("|\'))))|.*?((href=("|\')(.*?)("|\')).*?(rel=("|\')manifest("|\'))))[^>]*>(\W|$)/g;
};

OWPModel.prototype.testForManifest = function(pageText) {
  return this.getManifestRegex().test(pageText);
};

OWPModel.prototype.updateStatus = function(urlKey, url) {
  var firebase = this.getFirebase();
  var owpResults = firebase.child('/tests/owp/' + urlKey + '/');
  owpResults.once('value', function(snapshot) {
    var data = snapshot.val();
    if (data) {
      var dataAddedDate = new Date(data.lastUpdate);
      var difference = Date.now() - dataAddedDate.getTime();

      if (difference <= this.getResultValidExpiration()) {
        return;
      }
    }

    Promise.all([
      new Promise(function(resolve, reject) {
        // This test is for HTTPS support
        var uri = urlParser.parse(url);
        uri.secure = true;
        uri.timeout = 5000;
        WebRequest.request(uri, undefined, function(error, result) {
          if (error) {
            resolve(false);
          }
          resolve(true);
        });
      }),
      new Promise(function(resolve, reject) {
        var uri = urlParser.parse(url);
        uri.secure = uri.protocol === 'https:';
        WebRequest.request(uri, undefined, function(error, result) {
          if (error) {
            resolve(false);
          }

          var manifestCheck = this.testForManifest(result);
          resolve(this.testForManifest(result));
        }.bind(this));
      }.bind(this))
    ]).then(function(arrayOfResults) {
      var status = {
        https: arrayOfResults[0],
        webManifest: arrayOfResults[1]
      };

      owpResults.update(
        {
          url: url,
          status: status,
          lastUpdate: Firebase.ServerValue.TIMESTAMP
        }
      );

      var historyRef = firebase.child('/tests/history/owp/' + urlKey + '/');
      historyRef.push(
        {
          url: url,
          status: status,
          timestamp: Firebase.ServerValue.TIMESTAMP
        }
      );
    });
  }.bind(this));
};

module.exports = OWPModel;
