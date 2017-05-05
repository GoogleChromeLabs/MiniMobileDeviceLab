'use strict';

var URLKeyModel = require('./../model/URLKeyModel');
var ConfigModel = require('./../model/ConfigModel');
var CurrentURLModel = require('./../model/CurrentURLModel.js');
var TestDeviceModel = require('./../model/TestDeviceModel.js');
var PageSpeedModel = require('./../model/PageSpeedModel');
var WebPageTestModel = require('./../model/WebPageTestModel');
var DeviceController = require('./DeviceController.js');
var OWPModel = require('./../model/OWPModel');
var chalk = require('chalk');

function TestController(fb) {
  var firebase = fb;
  var urlKeyModel;
  var configModel;
  var currentUrlModel;
  var pageSpeedModel;
  var webPageTestModel;
  var owpModel;
  var deviceController;
  var testDevice;

  urlKeyModel = new URLKeyModel(firebase);
  configModel = new ConfigModel(firebase);
  currentUrlModel = new CurrentURLModel(firebase);
  pageSpeedModel = new PageSpeedModel(firebase, configModel);
  webPageTestModel = new WebPageTestModel(firebase, configModel);
  owpModel = new OWPModel(firebase);
  deviceController = new DeviceController();

  this.getFirebase = function() {
    return firebase;
  };

  this.getURLKeyModel = function() {
    return urlKeyModel;
  };

  this.getPageSpeedModel = function() {
    return pageSpeedModel;
  };

  this.getWebPageTestModel = function() {
    return webPageTestModel;
  };

  this.getOWPModel = function() {
    return owpModel;
  };

  this.getCurrentURLModel = function() {
    return currentUrlModel;
  };

  this.setUpTestDevice = function() {
    if (testDevice) {
      // Already got one
      return;
    }

    var deviceIds = deviceController.getDeviceIds();
    if (deviceIds.length === 0) {
      return;
    }

    testDevice = new TestDeviceModel(deviceIds[0], deviceController.getAdbClient());
  };

  this.getTestDevice = function() {
    return testDevice;
  };

  deviceController.on('DeviceAdded', function(device) {
    setTimeout(function() {
      this.setUpTestDevice();
    }.bind(this), 2000);
  }.bind(this));

  deviceController.on('DeviceRemoved', function(device) {
    if (testDevice) {
      testDevice.cancelTest();
    }
    testDevice = null;
    this.setUpTestDevice();
  }.bind(this));
}

TestController.prototype.performTests = function(url) {
  var urlKeyModel = this.getURLKeyModel();
  urlKeyModel.generateKey(url, function(err, urlKey) {
    if (err) {
      this.error('Error generating url key', err);
      return;
    }

    if (!urlKey) {
      this.error('We coudln\'t generate a key for this url');
      return;
    }

    var pagespeedModel = this.getPageSpeedModel();
    pagespeedModel.updateScores(urlKey, url);

    var webPageTestModel = this.getWebPageTestModel();
    webPageTestModel.updateTests(urlKey, url);

    var owpModel = this.getOWPModel();
    owpModel.updateStatus(urlKey, url, this.getTestDevice());
  }.bind(this));
};

TestController.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.cyan('TestController: ') + msg, arg);
};

TestController.prototype.error = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.cyan('TestController: ') + chalk.red(msg), arg);
};

module.exports = TestController;
