'use strict';

function LoopSettingsModel(fb) {
  var firebase = fb;
  var loopUrls = [];
  var loopIndex = null;
  var loopIntervalMs = 4000;

  firebase.child('loop/urls').on('value', function(snapshot) {
    console.log('LoopSettingsModel: Received loopUrls from Firebase');
    loopUrls = snapshot.val();
  });
  firebase.child('loop/loopintervalms').on('value', function(snapshot) {
    console.log('LoopSettingsModel: Received loopintervalms from Firebase');
    loopIntervalMs = snapshot.val();
  });
  firebase.child('loop/index').on('value', function(snapshot) {
    console.log('LoopSettingsModel: Received index from Firebase');
    loopIndex = snapshot.val();
    if (!loopIndex) {
      loopIndex = 0;
    }
  });

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

module.exports = LoopSettingsModel;
