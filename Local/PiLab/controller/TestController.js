'use strict';

var Firebase = require('firebase');
var URLKeyModel = require('./../model/URLKeyModel');
var ConfigModel = require('./../model/ConfigModel');
var PageSpeedModel = require('./../model/PageSpeedModel');
var WebPageTestModel = require('./../model/WebPageTestModel');
var OWPModel = require('./../model/OWPModel');

function TestController(fb) {
  var firebase = fb;
  var urlKeyModel;
  var configModel;
  var pageSpeedModel;
  var webPageTestModel;
  var owpModel;

  urlKeyModel = new URLKeyModel(firebase);
  configModel = new ConfigModel(firebase);
  pageSpeedModel = new PageSpeedModel(firebase, configModel);
  webPageTestModel = new WebPageTestModel(firebase, configModel);
  owpModel = new OWPModel(firebase);

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
}

TestController.prototype.performTests = function(url) {
  console.log('TestController: url = ', url);
  var urlKeyModel = this.getURLKeyModel();
  urlKeyModel.generateKey(url, function(err, urlKey) {
    if (err) {
      console.error('Error generating url key', err);
      return;
    }

    if (!urlKey) {
      console.error('We coudln\'t generate a key for this url');
      return;
    }

    console.log('Performing PageSpeed Insights checks');
    var pagespeedModel = this.getPageSpeedModel();
    pagespeedModel.updateScores(urlKey, url);

    console.log('Performing WebPageTest checks');
    var webPageTestModel = this.getWebPageTestModel();
    webPageTestModel.updateTests(urlKey, url);

    console.log('Performing OWP checks');
    var owpModel = this.getOWPModel();
    owpModel.updateStatus(urlKey, url);
  }.bind(this));
};

module.exports = TestController;
