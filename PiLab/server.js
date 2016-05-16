'use strict';

var os = require('os');
var ServerController = require('./controller/ServerController.js');
var config = require('./config.json');
var Firebase = require('firebase');

var firebase = new Firebase(config.firebaseUrl);
firebase.authWithCustomToken(config.firebaseKey, function(err, authToken) {
  if (err) {
    throw new Error(err);
  }

  firebase.child('server-running').once('value', function(snapshot) {
    if (snapshot.val() === true) {
      console.log('* Service Manager already running, exiting.');
      process.exit();
    } else {
      firebase.child('.info/connected').on('value', function(snapshot) {
        if (snapshot.val() === true) {
          firebase.child('server-running').set(true);
          firebase.child('server-running').onDisconnect().remove();
        }
      });

      new ServerController();

      var deviceName = os.hostname();
      if (deviceName.indexOf('.') >= 0) {
        deviceName = deviceName.substring(0, deviceName.indexOf('.'));
      }
      var fbMonitor = firebase.child('monitor/' + deviceName);
      fbMonitor.child('serverHeartbeart').set(Date.now());
      setInterval(function() {
        fbMonitor.child('serverHeartbeart').set(Date.now());
      }, 90 * 1000);
    }
  });
});
