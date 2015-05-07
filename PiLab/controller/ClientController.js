'use strict';

var ConfigModel = require('./../model/ConfigModel.js');
var CurrentURLModel = require('./../model/CurrentURLModel.js');
var DeviceModel = require('./../model/DeviceModel.js');
var BrowserIntentHelper = require('./../helper/BrowserIntentHelper.js');
var KeepScreenOnIntentHelper = require('./../helper/KeepScreenOnIntentHelper.js');
var Firebase = require('firebase');
var chalk = require('chalk');

var config = require('./../config.json');

function ClientController() {
  var configModel;
  var currentUrlModel;
  var deviceModel;

  var firebase = new Firebase(config.firebaseUrl);
  firebase.authWithCustomToken(config.firebaseKey, function(err, authToken) {
    if (err) {
      throw new Error(err);
    }

    currentUrlModel = new CurrentURLModel(firebase);
    configModel = new ConfigModel(firebase);

    currentUrlModel.on('URLChange', function(url) {
      this.log('URLChange with URL - ', url);
      this.updateAllDisplays();
    }.bind(this));

    currentUrlModel.on('OWPResultsChange', function(data) {
      this.log('OWPResultsChange');
      this.updateResultsDisplays('owp');
    }.bind(this));

    currentUrlModel.on('PSIResultsChange', function(data) {
      this.log('PSIResultsChange');
      this.updateResultsDisplays('psi');
    }.bind(this));

    currentUrlModel.on('WPTResultsChange', function(data) {
      this.log('WPTResultsChange');
      this.updateResultsDisplays('wpt');
    }.bind(this));

    configModel.on('GlobalModeChange', function(mode) {
      switch (mode) {
        case 'use':
          this.updateAllDisplays();
          break;
        case 'config':
          this.loadConfigPage();
          break;
      }
    }.bind(this));
  }.bind(this));

  deviceModel = new DeviceModel(firebase);
  deviceModel.on('DeviceAdded', function(deviceId) {
    // Launch keep screen on
    setTimeout(function() {
      var intentHandler =
        KeepScreenOnIntentHelper.getKeepScreenOnIntentHandler();
      this.getDeviceModel().launchIntentOnDevice(intentHandler, deviceId);
      if (!currentUrlModel) {
        return;
      }

      this.updateDeviceDisplay(deviceId);
    }.bind(this), 1000);
  }.bind(this));

  this.getDeviceModel = function() {
    return deviceModel;
  };

  this.getFirebase = function() {
    return firebase;
  };

  this.getCurrentURLModel = function() {
    return currentUrlModel;
  };

  this.getConfigModel = function() {
    return configModel;
  };
}

ClientController.prototype.updateAllDisplays = function() {
  var deviceModel = this.getDeviceModel();
  var deviceIds = deviceModel.getDeviceIds();
  for (var i = 0; i < deviceIds.length; i++) {
    this.updateDeviceDisplay(deviceIds[i]);
  }
};

ClientController.prototype.updateDeviceDisplay = function(deviceId) {
  if (this.getConfigModel().getGlobalMode() !== 'use') {
    return;
  }

  var deviceModel = this.getDeviceModel();
  var displayType = deviceModel.getDeviceDisplayType(deviceId);
  if (displayType) {
    this.handleDisplayingResults(displayType, deviceId);
  } else {
    var url = this.getCurrentURLModel().getUrl();
    this.presentUrlToDevice(url, deviceId);
  }
};

ClientController.prototype.updateResultsDisplays = function(updateFilter) {
  if (this.getConfigModel().getGlobalMode() !== 'use') {
    return;
  }

  var deviceModel = this.getDeviceModel();
  var deviceIds = deviceModel.getDeviceIds();

  for (var i = 0; i < deviceIds.length; i++) {
    var displayType = deviceModel.getDeviceDisplayType(deviceIds[i]);
    if (displayType && (!updateFilter || displayType === updateFilter)) {
      this.handleDisplayingResults(displayType, deviceIds[i]);
    }
  }
};

ClientController.prototype.handleDisplayingResults = function(displayType, deviceId) {
  var currentURLModel = this.getCurrentURLModel();
  var data = currentURLModel.getData();

  var results = [];

  switch (displayType) {
    case 'psi':
      results = [3];
      results[0] = {
        result: data.psi ? data.psi.mobile : null,
        title: 'Mobile Speed'
      };
      results[1] = {
        result: data.psi ? data.psi.desktop : null,
        title: 'Desktop Speed'
      };
      results[2] = {
        result: data.psi ? data.psi.ux : null,
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
      break;
    case 'wpt':
      results = [3];
      var speedIndex = null;
      var firstFullyLoaded = null;
      var secondFullyLoaded = null;
      try {
        speedIndex = data.wpt.avg.firstView.speedIndex;
      } catch (e) { }
      try {
        firstFullyLoaded = data.wpt.avg.firstView.fullyLoaded;
      } catch (e) { }
      try {
        secondFullyLoaded = data.wpt.avg.repeatView.fullyLoaded;
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
      break;
    case 'owp':
      console.log('----------------------------------');
      console.log('');
      console.log(data.owp);
      console.log('');
      console.log('----------------------------------');
      results = [4];
      results[0] = {
        title: 'HTTPS'
      };
      if (data.owp && data.owp.https !== null) {
        results[0].result = data.owp.https ? 'Yay' : 'Boo';
        results[0].bg = data.owp.https ? 'good' : 'bad';
      }

      results[1] = {
        title: 'Service Worker'
      };
      if (data.owp && data.owp.sw !== null) {
        results[1].result = data.owp.sw ? 'Yay' : 'Boo';
        results[1].bg = data.owp.sw ? 'good' : 'bad';
      }

      results[2] = {
        title: 'Theme Color'
      };
      if (data.owp && data.owp.themeColor !== null) {
        results[2].result = data.owp.themeColor ? 'Yay' : 'Boo';
        results[2].bg = data.owp.themeColor ? 'good' : 'bad';
      }

      results[3] = {
        title: 'Web App Manifest'
      };
      if (data.owp && data.owp.webManifest !== null) {
        results[3].result = data.owp.webManifest ? 'Yay' : 'Boo';
        results[3].bg = data.owp.webManifest ? 'good' : 'bad';
      }
      break;
    default:
      console.error('ClientController: Unknown display type.', displayType);
      return;
  }

  var displayUrl = config.frontEndUrl + '/displays/index.html#' +
    'url=' + encodeURI(currentURLModel.getUrl()) +
    '&displays=' + encodeURI(results.length);
  for (var j = 0; j < results.length; j++) {
    var result = results[j];
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

  this.log('Updating Displays ' + displayType + ' for ' + currentURLModel.getUrl());
  this.presentUrlToDevice(displayUrl, deviceId);
};

ClientController.prototype.presentUrlToDevice = function(url, deviceId) {
  var launchedUrl = url;

  var intentHandler = BrowserIntentHelper.getDeviceIntentHandler(launchedUrl);
  this.getDeviceModel().launchIntentOnDevice(intentHandler, deviceId);
};

ClientController.prototype.loadConfigPage = function() {
  var deviceModel = this.getDeviceModel();
  var deviceIds = deviceModel.getDeviceIds();
  var url = config.frontEndUrl + '/setup.html#deviceId=';
  for (var i = 0; i < deviceIds.length; i++) {
    var deviceId = deviceIds[i];
    var displayType = deviceModel.getDeviceDisplayType(deviceId);
    if (!displayType) {
      displayType = 'default';
    }

    var specificConfigUrl = url + deviceId + '&displayTypeId=' + displayType;

    var intentHandler = BrowserIntentHelper.getDeviceIntentHandler(specificConfigUrl);
    this.getDeviceModel().launchIntentOnDevice(intentHandler, deviceId);
  }
};

ClientController.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.blue('ClientController: ') + msg, arg);
};

module.exports = ClientController;
