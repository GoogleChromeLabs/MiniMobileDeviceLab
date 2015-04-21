'use strict';

var Firebase = require('firebase');
var WebPageTestLib = require('./../helper/WebPageTestLib');

function WebPageTestModel(fb, cModel) {
  var firebase = fb;
  var configModel = cModel;

  this.getApiKey = function() {
    return configModel.getApiKey('WebPageTest');
  };

  this.getFirebase = function() {
    return firebase;
  };

  this.getResultValidExpiration = function() {
    return 60 * 60 * 1000;
  };
}

WebPageTestModel.prototype.updateTests = function(urlKey, url) {
  var firebase = this.getFirebase();
  var wptResults = firebase.child('/tests/' + urlKey + '/wpt/');
  wptResults.once('value', function(snapshot) {
    var data = snapshot.val();
    if (data) {
      var dataAddedDate = new Date(data.lastUpdate);
      var difference = Date.now() - dataAddedDate.getTime();

      if (difference <= this.getResultValidExpiration()) {
        return;
      }
    }

    var mobileOptions = {
      url: url,
      key: this.getApiKey(),
      mobile: true
    };

    WebPageTestLib.queueUpTest(mobileOptions).then(function(data) {
      // We now need to wait for the test to run and complete
      WebPageTestLib.waitForTestResults(mobileOptions, data).then(function(results) {
        var strippedDownResults = {
          summary: results.data.summary,
          avg: {
            firstView: {
              loadtime: results.data.average.firstView.loadTime,
              render: results.data.average.firstView.render,
              fullyLoaded: results.data.average.firstView.fullyLoaded,
              speedIndex: results.data.average.firstView.SpeedIndex,
              requests: results.data.average.firstView.requests
            },
            repeatView: {
              loadtime: results.data.average.repeatView.loadTime,
              render: results.data.average.repeatView.render,
              fullyLoaded: results.data.average.repeatView.fullyLoaded,
              speedIndex: results.data.average.repeatView.SpeedIndex,
              requests: results.data.average.repeatView.requests
            }
          }
        };

        wptResults.update(
          {
            url: url,
            results: strippedDownResults,
            lastUpdate: Firebase.ServerValue.TIMESTAMP
          }
        );

        var historyRef = firebase.child('/tests/history/' + urlKey + '/wpt/');
        historyRef.push(
          {
            url: url,
            results: strippedDownResults,
            timestamp: Firebase.ServerValue.TIMESTAMP
          }
        );
      });
    }).catch(function(err) {
      console.error('WebPageTestModel: Unable to get run results.', err);
    });
  }.bind(this));
};

module.exports = WebPageTestModel;
