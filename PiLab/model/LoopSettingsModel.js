'use strict';

var chalk = require('chalk');

function LoopSettingsModel(fb) {
  var firebase = fb;
  var loopUrls = [];
  var loopIndex = null;
  var loopIntervalMs = 4000;

  firebase.child('loop/urls').on('value', function(snapshot) {
    this.log('Received loopUrls from Firebase');
    loopUrls = snapshot.val();
  }.bind(this));
  firebase.child('loop/loopintervalms').on('value', function(snapshot) {
    this.log('Received loopintervalms from Firebase');
    loopIntervalMs = snapshot.val();
  }.bind(this));
  firebase.child('loop/index').on('value', function(snapshot) {
    this.log('Received index from Firebase');
    loopIndex = snapshot.val();
    if (!loopIndex) {
      loopIndex = 0;
    }
  }.bind(this));

  this.getLoopUrls = function() {
    return loopUrls;
  };

  this.getLoopIntervalMs = function() {
    return loopIntervalMs;
  };

  this.getLoopIndex = function() {
    if (loopIndex === null) {
      return null;
    }

    return loopIndex % loopUrls.length;
  };

  this.setLoopIndex = function(newIndex) {
    firebase.child('loop/index').set(newIndex);
  };
}

LoopSettingsModel.prototype.log = function(msg, arg) {
  console.log(chalk.magenta('LoopSettingsModel: ') + msg, arg);
};

module.exports = LoopSettingsModel;
