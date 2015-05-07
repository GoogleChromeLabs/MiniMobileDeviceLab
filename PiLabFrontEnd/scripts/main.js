/* jshint browser: true */
/* global Firebase, fbKey */
'use strict';

var primaryPanel = document.querySelector('primary-panel');
var pages = document.querySelector('core-animated-pages');
var pToast = document.querySelector('paper-toast');
var pErrorToast = document.querySelector('error-toast');
var ignoreError = true;
var PiLabMode;

var fb = new Firebase(PiLab.config.firebaseUrl);
fb.authWithCustomToken(PiLab.config.firebaseKey, function(error) {
  if(error) {
    console.error('[FIREBASE] Auth failed. ' + error.toString());
    window.showErrorToast('Firebase authentication failure.');
  } else {
    console.log('[FIREBASE] Auth success.');
    fb.child('.info/connected').on('value', function(snapshot) {
      if (snapshot.val() === true) {
        window.showToast('Firebase connected.');
      } else {
        window.showErrorToast('Network disconnected.');
      }
    });
    fb.child('config/useMode').on('value', function(snapshot) {
      PiLabMode = snapshot.val();
    });
  }
});

window.showErrorToast = function(message) {
  if (pToast.opened === true) {
    pToast.dismiss();
  }
  if (message.length > 60) {
    message = message.substring(0, 59) + '...';
  }
  pErrorToast.text = message;
  pErrorToast.show();
  if (navigator.vibrate) {
    navigator.vibrate([300, 100, 100]);
  }
};

window.showToast = function(message) {
  pToast.text = message;
  pToast.show();
};
