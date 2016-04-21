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

    this.performTests(url)
    .then(function(results) {
      const fbFriendlyResults = {};
      results.forEach(aggregateResult => {
        const fbFriendlyResult = {
          title: aggregateResult.name,
          overallScore: aggregateResult.score.overall,
          tests: {}
        };

        const subItems = aggregateResult.score.subItems;
        subItems.forEach(subItem => {
          fbFriendlyResult.tests[subItem.name] = subItem.value;
        });
        fbFriendlyResults[fbFriendlyResult.title] = fbFriendlyResult;
      });

      urlsResults.update(
        {
          url: url,
          results: fbFriendlyResults,
          lastUpdate: Firebase.ServerValue.TIMESTAMP
        }
      );

      var historyRef = firebase.child('/tests/history/' + urlKey + '/lighthouse/');
      historyRef.push(
        {
          url: url,
          results: results,
          timestamp: Firebase.ServerValue.TIMESTAMP
        }
      );

      if (cb) {
        cb({
          url: url,
          results: results
        });
      }
    });
  }.bind(this));
};

LighthouseScoreModel.prototype.performTests = function(url) {
  return lighthouse({
    url: url,
    flags: {}
  })
  .catch(err => {
    console.log('Lighthouse Error. Did you run `npm run startLighthouse` ? ', err);
  });
};

module.exports = LighthouseScoreModel;
