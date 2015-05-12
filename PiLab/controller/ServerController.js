'use strict';

var ConfigModel = require('./../model/ConfigModel.js');
var CurrentURLModel = require('./../model/CurrentURLModel.js');
var LoopSettingsModel = require('./../model/LoopSettingsModel.js');
var TestController = require('./TestController.js');
var config = require('./../config.json');
var Firebase = require('firebase');
var chalk = require('chalk');

function ServerController() {
  var configModel;
  var currentUrlModel;
  var loopSettingsModel;
  var loopIndex = 0;
  var loopTimeoutId;
  var testController;

  var firebase = new Firebase(config.firebaseUrl);
  firebase.authWithCustomToken(config.firebaseKey, function(err, authToken) {
    if (err) {
      throw new Error(err);
    }

    testController = new TestController(firebase);
    loopSettingsModel = new LoopSettingsModel(firebase);
    currentUrlModel = new CurrentURLModel(firebase);
    configModel = new ConfigModel(firebase);

    configModel.on('UseModeChange', function(mode) {
      if (mode === 'loop') {
        this.startLooping();
      } else if (mode === 'loopPaused') {
        this.pauseLooping();
      } else {
        this.stopLooping();
      }
    }.bind(this));

    configModel.on('GlobalModeChange', function(mode) {
      if (mode === 'config') {
        this.stopLooping();
      } else {
        if (configModel.getUseMode() === 'loop') {
          this.startLooping();
        }
      }
    }.bind(this));

    currentUrlModel.on('URLChange', function(url) {
      this.log('URLChange: ' + url);
      var configModel = this.getConfigModel();
      if (configModel.getUseMode() === 'loopPaused') {
        this.pauseLooping();
      }
      var testController = this.getTestController();
      testController.performTests(url);
    }.bind(this));
  }.bind(this));

  this.getFirebase = function() {
    return firebase;
  };

  this.getCurrentUrlModel = function() {
    return currentUrlModel;
  };

  this.getLoopSettingsModel = function() {
    return loopSettingsModel;
  };

  this.getLoopIndex = function() {
    return loopIndex;
  };

  this.setLoopIndex = function(newIndex) {
    loopIndex = newIndex;
  };

  this.getLoopTimeoutId = function() {
    return loopTimeoutId;
  };

  this.setLoopTimeoutId = function(newId) {
    loopTimeoutId = newId;
  };

  this.getConfigModel = function() {
    return configModel;
  };

  this.getTestController = function() {
    return testController;
  };
}

ServerController.prototype.pauseLooping = function() {
  this.stopLooping();
  var loopSettingsModel = this.getLoopSettingsModel();
  var timeoutMs = loopSettingsModel.getLoopPauseMs();
  this.log('Loop Paused - restarting in ' + timeoutMs / 1000 + ' seconds');
  var newTimeoutId = setTimeout(this.resumeLooping.bind(this), timeoutMs);
  this.setLoopTimeoutId(newTimeoutId);
};

ServerController.prototype.resumeLooping = function() {
  this.log('Resuming loop');
  var configModel = this.getConfigModel();
  this.setLoopTimeoutId(null);
  configModel.setUseMode('loop');
};

ServerController.prototype.startLooping = function() {
  this.log('Starting Loop');

  var currentTimeoutId = this.getLoopTimeoutId();
  if (currentTimeoutId) {
    this.log('Loop already running. Sad Trombone.');
    return;
  }

  var loopSettingsModel = this.getLoopSettingsModel();
  var timeoutMs = loopSettingsModel.getLoopIntervalMs();
  var loopIndex = loopSettingsModel.getLoopIndex();
  if (loopIndex) {
    loopSettingsModel.setLoopIndex(loopIndex + 1);
  }
  var newTimeoutId = setTimeout(this.performLoopTick.bind(this), timeoutMs);
  this.setLoopTimeoutId(newTimeoutId);
};

ServerController.prototype.performLoopTick = function() {
  var loopSettingsModel = this.getLoopSettingsModel();
  var loopUrls = loopSettingsModel.getLoopUrls();
  var loopIndex = loopSettingsModel.getLoopIndex();
  var timeoutMs = loopSettingsModel.getLoopIntervalMs();
  if (!loopUrls || loopUrls.length === 0 || loopIndex === null ||
    !timeoutMs) {
    var newTimeoutId =  setTimeout(this.performLoopTick.bind(this), 500);
    this.setLoopTimeoutId(newTimeoutId);
    return;
  }

  // Clear any current pending timeout
  var currentTimeoutId = this.getLoopTimeoutId();
  if (currentTimeoutId) {
    clearTimeout(currentTimeoutId);
  }

  this.getCurrentUrlModel().setNewUrl(loopUrls[loopIndex]);

  var newTimeoutId = setTimeout(this.performLoopTick.bind(this), timeoutMs);
  this.setLoopTimeoutId(newTimeoutId);
  loopSettingsModel.setLoopIndex(loopIndex + 1);
};

ServerController.prototype.stopLooping = function() {
  this.log('Clearing loop timeouts');
  var currentTimeoutId = this.getLoopTimeoutId();
  if (currentTimeoutId) {
    clearTimeout(currentTimeoutId);
  }
  this.setLoopTimeoutId(null);
};

// TODO: Expose this via some sort of API or front end
ServerController.prototype.setStaticUrl = function(url) {
  this.log('setStaticURL: ' + url);
  var configModel = this.getConfigModel();
  if (configModel.getMode() === 'loop') {
    console.log('Can\'t set the url while the lab is looping');
    return;
  }

  this.getCurrentUrlModel().setNewUrl(url);
};

ServerController.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.green('ServerController: ') + msg, arg);
};

ServerController.prototype.error = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.green('ServerController: ') + chalk.red(msg), arg);
};

module.exports = ServerController;
