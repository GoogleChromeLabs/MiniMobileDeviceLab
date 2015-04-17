'use strict';

var adb = require('adbkit');

function DeviceModel(fb) {
  var deviceIds = [];
  var deviceDisplayTypes = {};

  var adbClient = adb.createClient();
  adbClient.trackDevices(function(err, tracker) {
    if (err) {
      console.log('DeviceModel: Could not set up adbkit', err);
      process.exit();
    }

    tracker.on('add', function(device) {
      console.log('DeviceModel: Device %s was plugged in', device.id);
      this.addDevice(device);
    }.bind(this));
    tracker.on('remove', function(device) {
      console.log('DeviceModel: Device %s was unplugged', device.id);
      this.removeDevice(device);
    }.bind(this));
    tracker.on('change', function(device) {
      console.log('DeviceModel: Device %s changed', device.id);
      if (device.type === 'device') {
        this.addDevice(device);
      } else if (device.type === 'offline') {
        this.removeDevice(device);
      }
    }.bind(this));
  }.bind(this));

  fb.child('device-display-types').on('value', function(snapshot) {
    var value = snapshot.val();
    deviceDisplayTypes = value;
  });

  this.addDevice = function(device) {
    deviceIds.push(device.id);
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
}

DeviceModel.prototype.launchIntentOnAllDevices = function(intentHandler) {
  var deviceIds = this.getDeviceIds();
  for (var i = 0; i < deviceIds.length; i++) {
    this.launchIntentOnDevice(intentHandler, deviceIds[i]);
  }
};

DeviceModel.prototype.launchIntentOnDevice = function(intentHandler, deviceId) {
  intentHandler(this.getAdbClient(), deviceId);
};

module.exports = DeviceModel;
