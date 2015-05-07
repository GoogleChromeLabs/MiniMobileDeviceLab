'use strict';

var DeviceController = require('./DeviceController.js');
var DeviceModel = require('./../model/DeviceModel');

var Firebase = require('firebase');
var chalk = require('chalk');

var config = require('./../config.json');

function ClientController() {
  var deviceController;
  var wrappedDevices = {};

  var firebase = new Firebase(config.firebaseUrl);
  firebase.authWithCustomToken(config.firebaseKey, function(err, authToken) {
    if (err) {
      throw new Error(err);
    }

    deviceController = new DeviceController();
    deviceController.on('DeviceAdded', function(device) {
      wrappedDevices[device.id] = new DeviceModel(
        firebase,
        deviceController.getAdbClient(),
        device.id);
    });
    deviceController.on('DeviceRemoved', function(device) {
      if (wrappedDevices[device.id]) {
        wrappedDevices[device.id].disconnected();
      }
      wrappedDevices[device.id] = null;
    });
  }.bind(this));

  this.getDeviceController = function() {
    return deviceController;
  };
}

ClientController.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.blue('ClientController: ') + msg, arg);
};

module.exports = ClientController;
