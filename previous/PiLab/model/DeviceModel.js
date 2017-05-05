'use strict';

var BrowserIntentHelper = require('./../helper/BrowserIntentHelper.js');
var KeepScreenOnIntentHelper = require(
  './../helper/KeepScreenOnIntentHelper.js');
var URLKeyModel = require('./URLKeyModel');
var CurrentURLModel = require('./CurrentURLModel.js');
var ConfigModel = require('./ConfigModel.js');
var config = require('./../config.json');

var chalk = require('chalk');

function DeviceModel(fb, adb, id) {
  var firebase = fb;
  var adbClient = adb;
  var deviceId = id;
  var deviceDisplayType;
  var isBusy = false;
  var pendingIntent = null;
  var openFirebaseRefs = [];
  var urlKeyModel = new URLKeyModel(firebase);
  var currentUrlModel = new CurrentURLModel(firebase);
  var configModel = new ConfigModel(firebase);

  this.getFirebase = function() {
    return firebase;
  };

  this.getDeviceId = function() {
    return deviceId;
  };

  this.getDisplayType = function() {
    return deviceDisplayType;
  };

  this.setDeviceBusy = function(busy) {
    isBusy = busy;

    if (!isBusy && pendingIntent) {
      this.launchIntent(pendingIntent);
      pendingIntent = null;
    }
  };

  this.isDeviceBusy = function(deviceId) {
    return isBusy;
  };

  this.setPendingIntent = function(intentHandler) {
    pendingIntent = intentHandler;
  };

  this.getAdbClient = function() {
    return adbClient;
  };

  this.addFirebaseRef = function(ref) {
    openFirebaseRefs.push(ref);
  };

  this.clearFirebaseRefs = function() {
    for (var i = 0; i < openFirebaseRefs.length; i++) {
      openFirebaseRefs[i].off();
    }
    openFirebaseRefs = [];
  };

  this.getURLKeyModel = function() {
    return urlKeyModel;
  };

  this.getCurrentURLModel = function() {
    return currentUrlModel;
  };

  this.getConfigModel = function() {
    return configModel;
  };

  // The timeout is to give adb time to
  // register the devices
  setTimeout(function() {
    var keepScreenOnIntent = KeepScreenOnIntentHelper.
      getKeepScreenOnIntentHandler();
    this.launchIntent(keepScreenOnIntent);

    firebase.child('device-display-types/' + deviceId)
    .on('value', function(snapshot) {
      var value = snapshot.val();
      deviceDisplayType = value;

      this.updateDisplay();
    }.bind(this));

    this._urlChangeListener = function(url) {
      this.updateDisplay();
    }.bind(this);

    this._globalModeChangeListener = function() {
      this.updateDisplay();
    }.bind(this);

    currentUrlModel.on('URLChange', this._urlChangeListener);

    configModel.on('GlobalModeChange', this._globalModeChangeListener);
  }.bind(this), 3000);
}

DeviceModel.prototype.updateDisplay = function() {
  this.clearFirebaseRefs();

  var displayType = this.getDisplayType();

  if (this.getConfigModel().getGlobalMode() === 'config') {
    var url = config.frontEndUrl + '/setup.html#deviceId=' + this.getDeviceId();

    if (!displayType) {
      displayType = 'default';
    }
    url += '&displayTypeId=' + displayType;
    var intentHandler = BrowserIntentHelper.getDeviceIntentHandler(url);
    this.launchIntent(intentHandler);
    return;
  }

  switch (displayType) {
    case 'psi':
      this.displayPSIResults();
      break;
    case 'wpt':
      this.displayWPTResults();
      break;
    case 'owp':
      this.displayOWPResults();
      break;
    default:
      this.displayCurrentURL();
      break;
  }
};

DeviceModel.prototype.displayCurrentURL = function() {
  var url = this.getCurrentURLModel().getUrl();
  var intentHandler = BrowserIntentHelper.getDeviceIntentHandler(url);
  this.launchIntent(intentHandler);
};

DeviceModel.prototype.displayWPTResults = function() {
  this.displayResultsUI('wpt', this.generateWPTUrl.bind(this));
};

DeviceModel.prototype.displayPSIResults = function() {
  this.displayResultsUI('psi', this.generatePSIUrl.bind(this));
};

DeviceModel.prototype.displayOWPResults = function() {
  this.displayResultsUI('owp', this.generateOWPUrl.bind(this));
};

DeviceModel.prototype.displayResultsUI = function(resultSet, cb) {
  var url = this.getCurrentURLModel().getUrl();
  var urlKeyModel = this.getURLKeyModel();

  urlKeyModel.getKey(url, function(err, urlKey) {
    if (err) {
      return;
    }

    var firebase = this.getFirebase();
    var resultsRef = firebase.child('/tests/' + urlKey + '/' + resultSet + '/');

    this.addFirebaseRef(resultsRef);

    resultsRef.on('value', function(snapshot) {
      var snapshotValue = snapshot.val();
      if (!snapshotValue) {
        snapshotValue = {
          url: url
        };
      }

      var launchUrl = cb(snapshotValue);
      var intentHandler = BrowserIntentHelper.getDeviceIntentHandler(launchUrl);
      this.launchIntent(intentHandler);
    }.bind(this));
  }.bind(this));
};

DeviceModel.prototype.generatePSIUrl = function(testData) {
  var data = {
    url: testData.url
  };

  var testResults = testData.results;
  var results = [3];
  results[0] = {
    result: testResults ? testResults.mobile : null,
    title: 'Mobile Speed'
  };
  results[1] = {
    result: testResults ? testResults.desktop : null,
    title: 'Desktop Speed'
  };
  results[2] = {
    result: testResults ? testResults.ux : null,
    title: 'UX Score'
  };

  for (var i = 0; i < results.length; i++) {
    if (results[i].result) {
      var bg = 'ok';
      if (results[i].result >= 85) {
        bg = 'good';
      } else if (results[i] < 65) {
        bg = 'bad';
      }
      results[i].bg = bg;
    }
  }
  data.results = results;
  return this.generateResultsUrl(data);
};

DeviceModel.prototype.generateWPTUrl = function(testData) {
  var data = {
    url: testData.url
  };

  var testResults = testData.results;
  var results = [3];
  var speedIndex = null;
  var firstFullyLoaded = null;
  var secondFullyLoaded = null;
  try {
    speedIndex = testResults.avg.firstView.speedIndex;
  } catch (e) { }

  try {
    firstFullyLoaded = testResults.avg.firstView.fullyLoaded;
  } catch (e) { }

  try {
    secondFullyLoaded = testResults.avg.repeatView.fullyLoaded;
  } catch (e) { }

  // WPT Speed Index
  results[0] = {
    result: speedIndex ? speedIndex : null,
    title: 'Speed Index'
  };
  if (results[0].result) {
    results[0].bg = 'ok';
    if (results[0].result < 2191) {
      results[0].bg = 'good';
    } else if (results[0].result > 4493) {
      results[0].bg = 'bad';
    }
  }

  // WPT First Load
  results[1] = {
    result: firstFullyLoaded ? (firstFullyLoaded / 1000) + 's' : null,
    title: 'First Load'
  };
  if (results[1].result) {
    results[1].bg = 'ok';
    if (firstFullyLoaded < 2000) {
      results[1].bg = 'good';
    } else if (firstFullyLoaded > 4000) {
      results[1].bg = 'bad';
    }
  }

  // WPT Second Load
  results[2] = {
    result: secondFullyLoaded ? (secondFullyLoaded / 1000) + 's' : null,
    title: 'Second Load'
  };
  if (results[2].result) {
    results[2].bg = 'ok';
    if (firstFullyLoaded < 1000) {
      results[2].bg = 'good';
    } else if (firstFullyLoaded > 2000) {
      results[2].bg = 'bad';
    }
  }
  data.results = results;
  return this.generateResultsUrl(data);
};

DeviceModel.prototype.generateOWPUrl = function(testData) {
  var data = {
    url: testData.url
  };

  var testResults = testData.results;
  var results = [4];
  results[0] = {
    title: 'HTTPS'
  };
  if (testResults && testResults.https !== null) {
    results[0].result = testResults.https ? 'Yay' : 'Boo';
    results[0].bg = testResults.https ? 'good' : 'bad';
  }

  results[1] = {
    title: 'Service Worker'
  };
  if (testResults && testResults.sw !== null) {
    results[1].result = testResults.sw ? 'Yay' : 'Boo';
    results[1].bg = testResults.sw ? 'good' : 'bad';
  }

  results[2] = {
    title: 'Theme Color'
  };
  if (testResults && testResults.themeColor !== null) {
    results[2].result = testResults.themeColor ? 'Yay' : 'Boo';
    results[2].bg = testResults.themeColor ? 'good' : 'bad';
  }

  results[3] = {
    title: 'Web App Manifest'
  };
  if (testResults && testResults.webManifest !== null) {
    results[3].result = testResults.webManifest ? 'Yay' : 'Boo';
    results[3].bg = testResults.webManifest ? 'good' : 'bad';
  }

  data.results = results;
  return this.generateResultsUrl(data);
};

DeviceModel.prototype.generateResultsUrl = function(data) {
  var displayUrl = config.frontEndUrl + '/displays/index.html#' +
    'url=' + encodeURI(data.url) +
    '&displays=' + encodeURI(data.results.length);
  for (var j = 0; j < data.results.length; j++) {
    var result = data.results[j];
    if (result.bg) {
      displayUrl += '&bg-' + j + '=' +  encodeURI(result.bg);
    }
    if (result.result) {
      displayUrl += '&result-' + j + '=' +  encodeURI(result.result);
    }
    if (result.title) {
      displayUrl += '&title-' + j + '=' +  encodeURI(result.title);
    }
  }
  return displayUrl;
};

DeviceModel.prototype.launchIntent = function(intentHandler) {
  if (this.isDeviceBusy()) {
    // Busy - stash intent for later
    console.log('DeviceModel.launchIntent(): Device is Busy()');
    this.setPendingIntent(intentHandler);
    return;
  }

  this.setDeviceBusy(true);

  console.log('DeviceModel.launchIntent(): About to fire intent');
  return intentHandler(this.getAdbClient(), this.getDeviceId())
    .then(function() {
      console.log('DeviceModel.launchIntent(): Intent fired successfully');
      this.setDeviceBusy(false);
    }.bind(this)).catch(function(err) {
      console.error('DeviceModel.launchIntent(): Unable to fire intent', err);
      this.setDeviceBusy(false);
    }.bind(this));
};

DeviceModel.prototype.disconnected = function() {
  this.clearFirebaseRefs();

  const currentUrlModel = this.getCurrentURLModel();
  if (currentUrlModel) {
    currentUrlModel.removeListener('URLChange', this._urlChangeListener);
  }

  const configModel = this.getConfigModel();
  if (configModel) {
    configModel.removeListener('GlobalModeChange', this._globalModeChangeListener);
  }

  this._urlChangeListener = null;
  this._globalModeChangeListener = null;
};

DeviceModel.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.red('DeviceModel: ') + msg, arg);
};

module.exports = DeviceModel;
