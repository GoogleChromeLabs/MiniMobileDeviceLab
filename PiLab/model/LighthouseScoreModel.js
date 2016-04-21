'use strict';

var Firebase = require('firebase');
var urlParser = require('url');
var WebRequest = require('./../helper/WebRequest');
var lighthouse = require('lighthouse');

function LighthouseScoreModel(fb) {
  var firebase = fb;

  this.getFirebase = function() {
    return firebase;
  };

  this.getResultValidExpiration = function() {
    // 1 hour
    return 60 * 60 * 1000;
  };
}

LighthouseScoreModel.prototype.updateStatus = function(urlKey, url, cb) {
  var firebase = this.getFirebase();
  var urlsResults = firebase.child('/tests/' + urlKey + '/lighthouse/');
  urlsResults.once('value', function(snapshot) {
    var data = snapshot.val();
    // Checked results
    if (data) {
      var dataAddedDate = new Date(data.lastUpdate);
      var difference = Date.now() - dataAddedDate.getTime();

      if (difference <= this.getResultValidExpiration()) {
        if (cb) {
          cb(data);
        }

        return;
      }
    }

    Promise.all([
      this.performTests(url)
    ]).then(function(arrayOfResults) {
      console.log('LighthouseScoreModel: results = ', arrayOfResults);
      /** var status = {
        https: arrayOfResults[0],
        webManifest: arrayOfResults[1].manifest,
        themeColor: arrayOfResults[1].themeColor,
        sw: arrayOfResults[1].sw
      };

      urlsResults.update(
        {
          url: url,
          results: status,
          lastUpdate: Firebase.ServerValue.TIMESTAMP
        }
      );

      var historyRef = firebase.child('/tests/history/' + urlKey + '/lighthouse/');
      historyRef.push(
        {
          url: url,
          results: status,
          timestamp: Firebase.ServerValue.TIMESTAMP
        }
      );

      if (cb) {
        cb({
          url: url,
          results: status
        });
      }**/
    });
  }.bind(this));
};

LighthouseScoreModel.prototype.performTests = function(url) {
  return lighthouse({
    url: url,
    flags: {}
  }).then(results => {
    console.log(results);
  });
};

module.exports = LighthouseScoreModel;
