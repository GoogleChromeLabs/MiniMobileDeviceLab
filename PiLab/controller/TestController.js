'use strict';

var URLKeyModel = require('./../model/URLKeyModel');
var ConfigModel = require('./../model/ConfigModel');
var CurrentURLModel = require('./../model/CurrentURLModel.js');
var PageSpeedModel = require('./../model/PageSpeedModel');
var WebPageTestModel = require('./../model/WebPageTestModel');
var LighthouseScoreModel = require('./../model/LighthouseScoreModel');
var chalk = require('chalk');

function TestController(fb) {
  var firebase = fb;
  var urlKeyModel;
  var configModel;
  var currentUrlModel;
  var pageSpeedModel;
  var webPageTestModel;
  var lighthouseScoreModel;

  urlKeyModel = new URLKeyModel(firebase);
  configModel = new ConfigModel(firebase);
  currentUrlModel = new CurrentURLModel(firebase);
  pageSpeedModel = new PageSpeedModel(firebase, configModel);
  webPageTestModel = new WebPageTestModel(firebase, configModel);
  lighthouseScoreModel = new LighthouseScoreModel(firebase);

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

  this.getLighthouseScoreModel = function() {
    return lighthouseScoreModel;
  };

  this.getCurrentURLModel = function() {
    return currentUrlModel;
  };
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

    var lighthouseScoreModel = this.getLighthouseScoreModel();
    lighthouseScoreModel.updateStatus(urlKey, url);
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
