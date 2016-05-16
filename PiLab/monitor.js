'use strict';

var fs = require('fs');
var os = require('os');
var Firebase = require('firebase');
var exec = require('child_process').exec;

var deviceName = os.hostname();
if (deviceName.indexOf('.') >= 0) {
  deviceName = deviceName.substring(0, deviceName.indexOf('.'));
}
console.log('Starting monitor for ', deviceName);

var config = fs.readFileSync('config.json', 'utf8');
config = JSON.parse(config);

var fb = new Firebase(config.firebaseUrl);
var fbNode;

fb.authWithCustomToken(config.firebaseKey, function(error, authToken) {
  if (error) {
    console.error('Auth Error', error);
  } else {
    console.log('Auth success.');
    fbReady();
  }
});

setTimeout(function() {
  console.log('***** 12 minute reboot.');
  var cmd = 'sudo reboot';
  exec(cmd, function(error, stdout, stderr) {});
}, 28 * 60 * 1000);

function fbReady() {
  fbNode = fb.child('monitor/' + deviceName);
  fb.child('.info/connected').on('value', function(snapshot) {
    if (snapshot.val() === true) {
      console.log('Connected.');
      fbNode.child('alive').set(true);
      fbNode.child('alive').onDisconnect().set(false);
      fbNode.child('reboot').set(false);
      fbNode.child('reboot').onDisconnect().remove();
      fbNode.child('heartbeat').set(Date.now());
      fbNode.child('heartbeat').onDisconnect().remove();
      fbNode.child('offlineAt').remove();
      fbNode.child('offlineAt')
        .onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
    } else {
      console.warn('Disconnected.');
    }
  });
  fbNode.child('reboot').on('value', rebootRequest);
  setInterval(heartbeat, 60 * 1000);
}

function heartbeat() {
  fbNode.child('heartbeat').set(Date.now());
}

function rebootRequest(snapshot) {
  if (snapshot.val() === true) {
    console.log('Reboot requested.');
    var cmd = 'sudo reboot';
    exec(cmd, function(error, stdout, stderr) {});
  }
}
