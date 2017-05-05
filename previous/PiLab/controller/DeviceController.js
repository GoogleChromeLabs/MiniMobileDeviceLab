'use strict';

var adb = require('adbkit');
var chalk = require('chalk');
var events = require('events');

function DeviceController() {
  var deviceIds = [];
  
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

  this.addDevice = function(device) {
    if (deviceIds.indexOf(device.id) !== -1) {
      return;
    }

    deviceIds.push(device.id);
    this.emit('DeviceAdded', device);
  };

  this.removeDevice = function(device) {
    var index = deviceIds.indexOf(device.id);
    if (index >= 0) {
      deviceIds.splice(index, 1);
    }
    this.emit('DeviceRemoved', device);
  };

  this.getAdbClient = function() {
    return adbClient;
  };

  this.getDeviceIds = function() {
    if (!deviceIds) {
      return [];
    }

    return deviceIds;
  };
}

DeviceController.prototype = events.EventEmitter.prototype;

DeviceController.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.red('DeviceController: ') + msg, arg);
};

module.exports = DeviceController;
