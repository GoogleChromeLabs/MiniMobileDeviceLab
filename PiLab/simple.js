'use strict';

var fs = require('fs');
var adb = require('adbkit');
var Firebase = require('firebase');
var exec = require('child_process').exec;

var config = fs.readFileSync('config.json', 'utf8');
config = JSON.parse(config);

var deviceIds = {};
var urlLastChanged = 0;

console.log('MiniMobileDeviceLab vYeahHah1');

var fb = new Firebase(config.firebaseUrl);
fb.authWithCustomToken(config.firebaseKey, function(error, authToken) {
  if (error) {
    console.error('Auth Error', error);
  } else {
    console.log('Auth success.');
    fb.child('url').on('value', function(snapshot) {
      urlLastChanged = Date.now();
      pushURL(snapshot.val());
    });
    fb.child('.info/connected').on('value', function(snapshot) {
      if (snapshot.val() === false) {
        console.log('Firebase connection lost, rebooting...');
        rebootPi();
      }
    });
  }
});

setInterval(function() {
  var timeSinceChange = Date.now() - urlLastChanged;
  if (urlLastChanged !== 0 && timeSinceChange > 90000) {
    console.log('Time Since Change Exceeded, rebooting!');
    rebootPi();
  }
}, 3000);

function getIntent(url) {
  var FLAG_ACTIVITY_NEW_TASK = 0x10000000;

  var intent = {
    'component': 'com.android.chrome/com.google.android.apps.chrome.Main',
    'wait': false,
    'action': 'android.intent.action.VIEW',
    'flags': [FLAG_ACTIVITY_NEW_TASK],
    'data': url,
    'extras': [
      {
        'key': 'com.android.browser.application_id',
        'type': 'string',
        'value': 'com.android.chrome'
      }
    ]
  };
  return intent;
}

function pushURL(url) {
  console.log('push', url);
  var intent = getIntent(url);
  Object.keys(deviceIds).forEach(function(id) {
    console.log(id, url);
    adbClient.startActivity(id, intent);
  });
}

function rebootPi() {
  console.log('reboot');
  var cmd = 'sudo reboot';
  exec(cmd, function(error, stdout, stderr) {});
}

function addDevice(id) {
  console.log('add', id);
  adbClient.startActivity(id, getIntent('https://www.google.com/'));
  deviceIds[id] = true;
}

function removeDevice(id) {
  console.log('remove', id);
  delete deviceIds[id];
}

var adbClient = adb.createClient();
adbClient.trackDevices(function(err, tracker) {
  if (err) {
    console.log('DeviceModel: Could not set up adbkit', err);
    rebootPi();
    return;
  }
  tracker.on('add', function(device) {
    addDevice(device.id);
  });
  tracker.on('remove', function(device) {
    removeDevice(device.id);
  });
  tracker.on('change', function(device) {
    console.log('changed', device.id);
    if (device.type === 'device') {
      addDevice(device.id);
    } else if (device.type === 'offline') {
      removeDevice(device.id);
    }
  });
});
