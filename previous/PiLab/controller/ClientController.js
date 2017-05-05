'use strict';

var os = require('os');
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

    var deviceName = os.hostname();
    if (deviceName.indexOf('.') >= 0) {
      deviceName = deviceName.substring(0, deviceName.indexOf('.'));
    }
    var fbMonitor = firebase.child('monitor/' + deviceName);
    fbMonitor.child('clientHeartbeart').set(Date.now());
    setInterval(function() {
      console.log('clientHeartbeart', Date.now());
      fbMonitor.child('clientHeartbeart').set(Date.now());
    }, 90 * 1000);

    deviceController = new DeviceController();
    deviceController.on('DeviceAdded', function(device) {
      wrappedDevices[device.id] = new DeviceModel(
        firebase,
        deviceController.getAdbClient(),
        device.id);
      fbMonitor.child('clients/' + device.id).set(true);
    });
    deviceController.on('DeviceRemoved', function(device) {
      if (wrappedDevices[device.id]) {
        wrappedDevices[device.id].disconnected();
      }
      fbMonitor.child('clients/' + device.id).remove();
      delete wrappedDevices[device.id];
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
