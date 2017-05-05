'use strict';

var fs = require('fs');
var os = require('os');
var Firebase = require('firebase');
var exec = require('child_process').exec;

var FORCED_REBOOT_TIMEOUT = 58;

var clientStartedAt = Date.now();
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
  var reason = '*MONITOR* forced reboot after' + FORCED_REBOOT_TIMEOUT;
  reason += ' minutes.';
  console.log('***** ' + FORCED_REBOOT_TIMEOUT + ' minute reboot.');
  var now = Date.now();
  var dt = new Date().toLocaleString();
  var ranFor = (Date.now() - clientStartedAt) / 1000;
  var log = {
    date: now,
    dt: dt,
    ranFor: ranFor,
    reason: reason
  };
  if (fb) {
    fb.child('clients/' + deviceName + '/rebootLog').push(log);
    fb.child('clients/' + deviceName + '/rebooting').set(reason);
  }
  setTimeout(function() {
    var cmd = 'sudo reboot';
    exec(cmd, function(error, stdout, stderr) {});
  }, 500);
}, FORCED_REBOOT_TIMEOUT * 60 * 1000);

function fbReady() {
  fbNode = fb.child('monitor/' + deviceName);
  fbNode.child('version').set('0917');
  fbNode.child('startedAt').set(new Date().toLocaleString());
  heartbeat();
  fb.child('.info/connected').on('value', function(snapshot) {
    if (snapshot.val() === true) {
      console.log('Connected.');
      heartbeat();
      fbNode.child('alive').onDisconnect().set(false);
      fbNode.child('reboot').onDisconnect().remove();
      fbNode.child('heartbeat').onDisconnect().remove();
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
  fbNode.child('alive').set(true);
  fbNode.child('reboot').set(false);
  fbNode.child('offlineAt').remove();
  fbNode.child('heartbeat').set(new Date().toLocaleString());
}

function rebootRequest(snapshot) {
  if (snapshot.val() === true) {
    console.log('Reboot requested.');
    var cmd = 'sudo reboot';
    exec(cmd, function(error, stdout, stderr) {});
  }
}
