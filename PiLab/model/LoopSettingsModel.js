'use strict';

function LoopSettingsModel(fb) {
  var firebase = fb;
  var loopUrls = [];
  var loopIntervalMs = 4000;

  firebase.child('loop/urls').on('value', function(snapshot) {
    console.log('LoopSettingsModel: Received loopUrls from Firebase');
    loopUrls = snapshot.val();
  });
  firebase.child('loop/loopintervalms').on('value', function(snapshot) {
    console.log('LoopSettingsModel: Received loopintervalms from Firebase');
    loopIntervalMs = snapshot.val();
  });

  this.getLoopUrls = function() {
    return loopUrls;
  };

  this.getLoopIntervalMs = function() {
    return loopIntervalMs;
  };
}

module.exports = LoopSettingsModel;
