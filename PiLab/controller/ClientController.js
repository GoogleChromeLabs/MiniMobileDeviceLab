'use strict';

var DeviceController = require('./DeviceController.js');
var Firebase = require('firebase');
var chalk = require('chalk');

var config = require('./../config.json');

function ClientController() {
  var deviceController;

  var firebase = new Firebase(config.firebaseUrl);
  firebase.authWithCustomToken(config.firebaseKey, function(err, authToken) {
    if (err) {
      throw new Error(err);
    }

    deviceController = new DeviceController(firebase);

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
