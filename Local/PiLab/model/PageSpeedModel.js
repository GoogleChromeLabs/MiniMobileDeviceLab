'use strict';

var Firebase = require('firebase');
var PageSpeedLib = require('./../helper/PageSpeedLib');

function PageSpeedModel(fb, cModel) {
  var firebase = fb;
  var configModel = cModel;

  this.getApiKey = function() {
    return configModel.getApiKey('PageSpeedInsights');
  };

  this.getFirebase = function() {
    return firebase;
  };

  this.getResultValidExpiration = function() {
    return 60 * 60 * 1000;
  };
}

PageSpeedModel.prototype.updateScores = function(urlKey, url) {
  var firebase = this.getFirebase();
  var psiResults = firebase.child('/tests/psi/' + urlKey + '/');
  psiResults.once('value', function(snapshot) {
    var data = snapshot.val();
    if (data) {
      var dataAddedDate = new Date(data.lastUpdate);
      var difference = Date.now() - dataAddedDate.getTime();

      if (difference <= this.getResultValidExpiration()) {
        return;
      }
    }

    var desktopOptions = {
      url: url,
      key: this.getApiKey(),
      strategy: 'desktop'
    };

    var mobileOptions = {
      url: url,
      key: this.getApiKey(),
      strategy: 'mobile'
    };

    Promise.all([
      PageSpeedLib.getScores(desktopOptions),
      PageSpeedLib.getScores(mobileOptions)
    ]).then(function(arrayOfResults) {
      var scores = {
        desktop: arrayOfResults[0].score.speed,
        mobile: arrayOfResults[1].score.speed,
        ux: arrayOfResults[1].score.ux
      };

      psiResults.update({
        url: url,
        scores: scores,
        lastUpdate: Firebase.ServerValue.TIMESTAMP
      });

      var historyRef = firebase.child('/tests/history/psi/' + urlKey + '/');
      historyRef.push(
        {
          url: url,
          scores: scores,
          timestamp: Firebase.ServerValue.TIMESTAMP
        }
      );
    }).catch(function(err) {
      console.error('PageSpeedModel: Unable to get Scores.', err);
    });
  }.bind(this));
};

module.exports = PageSpeedModel;
