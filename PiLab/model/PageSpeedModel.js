'use strict';

var Firebase = require('firebase');
var PageSpeedLib = require('./../helper/PageSpeedLib');
var chalk = require('chalk');

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

PageSpeedModel.prototype.updateScores = function(urlKey, url, cb) {
  var firebase = this.getFirebase();
  var psiResults = firebase.child('/tests/' + urlKey + '/psi/');
  psiResults.once('value', function(snapshot) {
    var data = snapshot.val();
    if (data) {
      var dataAddedDate = new Date(data.lastUpdate);
      var difference = Date.now() - dataAddedDate.getTime();

      if (difference <= this.getResultValidExpiration()) {
        if (cb) {
          this.log('Returning reused scores (' + url + ')', data);
          cb(data);
        }
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
        results: scores,
        lastUpdate: Firebase.ServerValue.TIMESTAMP
      });

      var historyRef = firebase.child('/tests/history/' + urlKey + '/psi/');
      historyRef.push(
        {
          url: url,
          results: scores,
          timestamp: Firebase.ServerValue.TIMESTAMP
        }
      );

      if (cb) {
        this.log('Returning new scores');
        cb({
          url: url,
          results: scores
        });
      }
    }.bind(this)).catch(function(err) {
      this.error('Unable to get Scores.', err);
    }.bind(this));
  }.bind(this));
};

PageSpeedModel.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.gray('PageSpeedModel: ') + msg, arg);
};

PageSpeedModel.prototype.error = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.gray('PageSpeedModel: ') + chalk.red(msg), arg);
};

module.exports = PageSpeedModel;
