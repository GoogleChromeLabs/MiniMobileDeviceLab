'use strict';

var adb = require('adbkit');
var chalk = require('chalk');
var events = require('events');

function DeviceModel(fb) {
  var deviceIds = [];
  var deviceDisplayTypes = {};
  var deviceIntentQueues = {};

  var adbClient = adb.createClient();
  adbClient.trackDevices(function(err, tracker) {
    if (err) {
      this.log('DeviceModel: Could not set up adbkit', err);
      process.exit();
    }

    tracker.on('add', function(device) {
      this.log('DeviceModel: Device %s was plugged in', device.id);
      this.addDevice(device);
    }.bind(this));
    tracker.on('remove', function(device) {
      this.log('DeviceModel: Device %s was unplugged', device.id);
      this.removeDevice(device);
    }.bind(this));
    tracker.on('change', function(device) {
      this.log('DeviceModel: Device %s changed', device.id);
      if (device.type === 'device') {
        this.addDevice(device);
      } else if (device.type === 'offline') {
        this.removeDevice(device);
      }
    }.bind(this));
  }.bind(this));

  fb.child('device-display-types').on('value', function(snapshot) {
    var value = snapshot.val();
    if (!value) {
      value = {};
    }
    deviceDisplayTypes = value;
  });

  this.addDevice = function(device) {
    if (deviceIds.indexOf(device.id) !== -1) {
      return;
    }

    deviceIds.push(device.id);
    this.emit('DeviceAdded', device.id);
    console.log('addDevice: ', deviceIds);
  };

  this.removeDevice = function(device) {
    var index = deviceIds.indexOf(device.id);
    if (index >= 0) {
      deviceIds.splice(index, 1);
    }
  };

  this.getAdbClient = function() {
    return adbClient;
  };

  this.getDeviceIds = function() {
    return deviceIds;
  };

  this.getDeviceDisplayType = function(deviceId) {
    if (deviceDisplayTypes[deviceId]) {
      return deviceDisplayTypes[deviceId];
    }

    return null;
  };

  this.setDeviceBusy = function(deviceId, isBusy) {
    if (!deviceIntentQueues[deviceId]) {
      deviceIntentQueues[deviceId] = {};
    }
    deviceIntentQueues[deviceId].busy = isBusy;
    if (!isBusy && deviceIntentQueues[deviceId].pending) {
      this.log('Launching a pending intent', deviceId);
      this.launchIntentOnDevice(deviceIntentQueues[deviceId].pending, deviceId);
    }
    deviceIntentQueues[deviceId] = null;
  };

  this.isDeviceBusy = function(deviceId) {
    return deviceIntentQueues[deviceId] ?
      deviceIntentQueues[deviceId].busy : false;
  };

  this.setPendingIntent = function(deviceId, intentHandler) {
    deviceIntentQueues[deviceId].pending = intentHandler;
  };
}

DeviceModel.prototype = events.EventEmitter.prototype;

DeviceModel.prototype.launchIntentOnAllDevices = function(intentHandler) {
  this.log('launchIntentOnAllDevices with - ', intentHandler);
  var deviceIds = this.getDeviceIds();
  for (var i = 0; i < deviceIds.length; i++) {
    this.launchIntentOnDevice(intentHandler, deviceIds[i]);
  }
};

DeviceModel.prototype.launchIntentOnDevice = function(intentHandler, deviceId) {
  this.log('launchIntentOnDevice');
  if (this.isDeviceBusy(deviceId)) {
    // Busy - stash intent for later
    this.log('Device is busy', deviceId);
    this.setPendingIntent(deviceId, intentHandler);
    return;
  }

  this.setDeviceBusy(deviceId, true);
  intentHandler(this.getAdbClient(), deviceId)
    .then(function() {
      this.setDeviceBusy(deviceId, false);
    }.bind(this)).catch(function() {
      this.setDeviceBusy(deviceId, false);
    }.bind(this));
};

DeviceModel.prototype.log = function(msg, arg) {
  console.log(chalk.red('DeviceModel: ') + msg, arg);
};

module.exports = DeviceModel;
