'use strict';

var ConfigModel = require('./../model/ConfigModel.js');
var CurrentURLModel = require('./../model/CurrentURLModel.js');
var LoopSettingsModel = require('./../model/LoopSettingsModel.js');
var TestController = require('./TestController.js');
var config = require('./../config.json');
var Firebase = require('firebase');

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

    configModel.on('ModeChange', function(mode) {
      if (mode === 'loop') {
        this.startLooping();
      } else {
        this.stopLooping();
      }

      // TODO: Handle config
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

ServerController.prototype.startLooping = function() {
  console.log('MainController: Start Looping');

  this.performLoopTick();
};

ServerController.prototype.performLoopTick = function() {
  var loopSettingsModel = this.getLoopSettingsModel();
  var loopUrls = loopSettingsModel.getLoopUrls();
  if (loopUrls.length === 0) {
    return setTimeout(this.performLoopTick.bind(this), 500);
  }

  var timeoutMs = loopSettingsModel.getLoopIntervalMs();
  var loopIndex = this.getLoopIndex() % loopUrls.length;

  // Clear any current pending timeout
  var currentTimeoutId = this.getLoopTimeoutId();
  if (currentTimeoutId) {
    clearTimeout(currentTimeoutId);
  }

  var testController = this.getTestController();
  testController.performTests(loopUrls[loopIndex]);

  this.getCurrentUrlModel().setNewUrl(loopUrls[loopIndex]);

  var newTimeoutId = setTimeout(this.performLoopTick.bind(this), timeoutMs);
  this.setLoopTimeoutId(newTimeoutId);
  this.setLoopIndex(loopIndex + 1);
};

ServerController.prototype.stopLooping = function() {
  console.log('MainController: Stop Looping');
  var currentTimeoutId = this.getLoopTimeoutId();
  if (currentTimeoutId) {
    clearTimeout(currentTimeoutId);
  }
  this.setLoopTimeoutId(null);

  var singleUrl = this.getCurrentUrlModel().getUrl();
  
};

// TODO: Expose this via some sort of API or front end
ServerController.prototype.setStaticUrl = function(url) {
  var configModel = this.getConfigModel();
  if (configModel.getMode() === 'loop') {
    console.log('Can\'t set the url while the lab is looping');
    return;
  }

  this.getCurrentUrlModel().setNewUrl(url);
};

module.exports = ServerController;
