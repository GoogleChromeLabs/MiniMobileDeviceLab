'use strict';

var chalk = require('chalk');
var DEFAULT_LOOP_INTERVAL_MS = 40000;
function LoopSettingsModel(fb) {
  var firebase = fb;
  var loopUrls = [];
  var loopIndex = null;
  var loopIntervalMs = DEFAULT_LOOP_INTERVAL_MS;

  firebase.child('loop/urls').on('value', function(snapshot) {
    this.log('Received loopUrls from Firebase');
    loopUrls = snapshot.val();
  }.bind(this));
  firebase.child('loop/loopintervalms').on('value', function(snapshot) {
    var newLoopInterval = snapshot.val();
    if (!newLoopInterval) {
      firebase.child('loop/loopintervalms').set(DEFAULT_LOOP_INTERVAL_MS);
      return;
    }

    this.log('Received loopintervalms from Firebase - ', newLoopInterval);
    loopIntervalMs = newLoopInterval;
  }.bind(this));
  firebase.child('loop/index').on('value', function(snapshot) {
    loopIndex = snapshot.val();
    if (!loopIndex) {
      loopIndex = 0;
    }

    var now = new Date();
    var time = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    this.log('Updating loop index from Firebase - ' + loopIndex, time);
  }.bind(this));

  this.getLoopUrls = function() {
    return loopUrls;
  };

  this.getLoopIntervalMs = function() {
    if (!loopIntervalMs) {
      return DEFAULT_LOOP_INTERVAL_MS;
    }

    return loopIntervalMs;
  };

  this.getLoopIndex = function() {
    if (loopIndex === null || !loopUrls) {
      return null;
    }

    return loopIndex % loopUrls.length;
  };

  this.setLoopIndex = function(newIndex) {
    firebase.child('loop/index').set(newIndex);
  };
}

LoopSettingsModel.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.magenta('LoopSettingsModel: ') + msg, arg);
};

module.exports = LoopSettingsModel;
