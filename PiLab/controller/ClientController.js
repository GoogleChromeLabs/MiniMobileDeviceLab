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
      this.presentUrl(url);
    }.bind(this));

    configModel.on('GlobalModeChange', function(mode) {
      switch (mode) {
        case 'use':
          var url = currentUrlModel.getUrl();
          if (url) {
            this.presentUrl(url);
          }
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

      var url = currentUrlModel.getUrl();
      if (url) {
        this.presentUrlToDevice(url, deviceId);
      }
    }.bind(this), 1000);
  }.bind(this));
  this.getDeviceModel = function() {
    return deviceModel;
  };
}

ClientController.prototype.presentUrl = function(url) {
  var deviceIds = this.getDeviceModel().getDeviceIds();
  for (var i = 0; i < deviceIds.length; i++) {
    this.presentUrlToDevice(url, deviceIds[i]);
  }
};

ClientController.prototype.presentUrlToDevice = function(url, deviceId) {
  var displayType = this.getDeviceModel().getDeviceDisplayType(deviceId);
  var launchedUrl = url;
  if (displayType) {
    launchedUrl = config.frontEndUrl + '/displays/' + displayType + '.html?url=' + encodeURI(url);
  }
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
