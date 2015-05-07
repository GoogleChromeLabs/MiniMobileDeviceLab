'use strict';

var Firebase = require('firebase');
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
  return /<link(.*?((rel=("|\')manifest("|\').*?(href=("|\')(.*?)("|\'))))|.*?((href=("|\')(.*?)("|\')).*?(rel=("|\')manifest("|\'))))[^>]*>/g;
};

OWPModel.prototype.getThemeColorRegex = function() {
  return /<meta(.*?((name=("|\')?theme-color("|\')?.*?(content=("|\')(.*?)("|\'))))|.*?((content=("|\')(.*?)("|\')).*?(name=("|\')?theme-color("|\')?)))[^>]*>/g;
};

OWPModel.prototype.testForManifest = function(pageText) {
  return this.getManifestRegex().test(pageText);
};

OWPModel.prototype.testForThemeColor = function(pageText) {
  return this.getThemeColorRegex().test(pageText);
};

OWPModel.prototype.updateStatus = function(urlKey, url, testDevice, cb) {
  var firebase = this.getFirebase();
  var owpResults = firebase.child('/tests/' + urlKey + '/owp/');
  owpResults.once('value', function(snapshot) {
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

    /**Promise.all([
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
          var themeColorCheck = this.testForThemeColor(result);
          resolve({manifest: manifestCheck, themeColor: themeColorCheck});
        }.bind(this));
      }.bind(this))
    ]).then(function(arrayOfResults) {
      var status = {
        https: arrayOfResults[0],
        webManifest: arrayOfResults[1].manifest,
        themeColor: arrayOfResults[1].themeColor
      };

      owpResults.update(
        {
          url: url,
          results: status,
          lastUpdate: Firebase.ServerValue.TIMESTAMP
        }
      );

      var historyRef = firebase.child('/tests/history/' + urlKey + '/owp/');
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
      }
    });**/
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
      this.performDeviceTests(url, testDevice)
    ]).then(function(arrayOfResults) {
      console.log('OWPModel: results = ', arrayOfResults);
      var status = {
        https: arrayOfResults[0],
        webManifest: arrayOfResults[1].manifest,
        themeColor: arrayOfResults[1].themeColor,
        sw: arrayOfResults[1].sw
      };

      owpResults.update(
        {
          url: url,
          results: status,
          lastUpdate: Firebase.ServerValue.TIMESTAMP
        }
      );

      var historyRef = firebase.child('/tests/history/' + urlKey + '/owp/');
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
      }
    });
  }.bind(this));
};

OWPModel.prototype.performDeviceTests = function(url, testDevice) {
  if (!testDevice) {
    return this.performFallbackTests(url);
  }

  console.log('performDeviceTests: ' + url);

  if (testDevice.isCurrentlyTesting()) {
    testDevice.cancelTest();
  }
  return testDevice.performTests(url);
};

OWPModel.prototype.performFallbackTests = function(url) {
  return new Promise(function(resolve, reject) {
    var uri = urlParser.parse(url);
    uri.secure = uri.protocol === 'https:';
    WebRequest.request(uri, undefined, function(error, result) {
      if (error) {
        resolve(false);
      }

      var manifestCheck = this.testForManifest(result);
      var themeColorCheck = this.testForThemeColor(result);
      resolve({manifest: manifestCheck, themeColor: themeColorCheck});
    }.bind(this));
  }.bind(this));
};

module.exports = OWPModel;
