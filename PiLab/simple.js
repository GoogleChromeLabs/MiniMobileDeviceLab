'use strict';

var os = require('os');
var fs = require('fs');
var adb = require('adbkit');
var Firebase = require('firebase');
var exec = require('child_process').exec;

var HEARTBEAT_INTERVAL = 60 * 1000;
var TIME_BETWEEN_UPDATES_INTERVAL = 3 * 1000;
var MAX_TIME_BETWEEN_UPDATES = 75;
var VERSION = '20160518-0917';

var keepScreenOnIntent = {
  'wait': true,
  'action': 'android.intent.category.LAUNCHER',
  'component': 'com.synetics.stay.alive/.main'
};

var config = fs.readFileSync('config.json', 'utf8');
config = JSON.parse(config);

var deviceIds = {};
var url = 'https://www.google.com';
var urlLastChanged = 0;

var piName = os.hostname();
if (piName.indexOf('.') >= 0) {
  piName = piName.substring(0, piName.indexOf('.'));
}
var reportPath = 'clients/' + piName + '/';

var clientStartedAt = Date.now();

console.log('MiniMobileDeviceLab');
console.log(' version:', VERSION);
console.log(' computerName:', piName);
console.log(' started at:', new Date().toLocaleString());
console.log('');

var fb = new Firebase(config.firebaseUrl);
fb.authWithCustomToken(config.firebaseKey, function(error, authToken) {
  if (error) {
    console.error('FB Authentication Failure', error);
    process.exit();
  } else {
    console.log('FB Authenticated');
    fb.child(reportPath + 'startedAt').set(new Date().toLocaleString());
    fb.child(reportPath + 'version').set(VERSION);
    fb.child(reportPath + 'reboot').set(false);
    fb.child(reportPath + 'reboot').onDisconnect().remove();
    fb.child(reportPath + 'clients').remove();
    fb.child(reportPath + 'rebooting').remove();
    fb.child(reportPath + 'timeSinceChange').set(0);
    fb.child('url').on('value', pushURL);
    fb.child(reportPath + 'reboot').on('value', function(snapshot) {
      if (snapshot.val() === true) {
        rebootPi('Remote reboot requested.');
      }
    });
    fb.child('.info/connected').on('value', function(snapshot) {
      if (snapshot.val() === true) {
        console.log('FB Connected');
        fb.child(reportPath + 'connectedAt').set(new Date().toLocaleString());
        fb.child(reportPath + 'connectedAt').onDisconnect().remove();
        fb.child(reportPath + 'alive').set(true);
        fb.child(reportPath + 'alive').onDisconnect().set(false);
        fb.child(reportPath + 'disconnectedAt').remove();
        fb.child(reportPath + 'disconnectedAt')
          .onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
      } else if (snapshot.val() === false) {
        process.exit();
        //rebootPi('Firebase connection lost');
        return;
      }
    });
    heartBeat();
  }
});

function heartBeat() {
  console.log('>> Heartbeat', new Date().toLocaleString());
  setTimeout(heartBeat, HEARTBEAT_INTERVAL);
}

setInterval(function() {
  var timeSinceChange = (Date.now() - urlLastChanged) / 1000;
  if (urlLastChanged !== 0 && timeSinceChange > MAX_TIME_BETWEEN_UPDATES) {
    var msg = 'URL Change Timeout: ' + timeSinceChange + 's';
    process.exit();
    //rebootPi(msg);
  } else {
    fb.child(reportPath + 'timeSinceChange').set(timeSinceChange);
  }

}, TIME_BETWEEN_UPDATES_INTERVAL);

function getBrowseIntent(url) {
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

function pushURL(snapshot) {
  url = snapshot.val();
  urlLastChanged = Date.now();
  var dt = new Date().toLocaleString();
  var keys = Object.keys(deviceIds);
  console.log('***', url, '[' + keys.length + ']', '(' + dt + ')');
  fb.child(reportPath + 'url').set(url);
  fb.child(reportPath + 'urlTime').set(dt);
  fb.child(reportPath + 'timeSinceChange').set(0);
  var intent = getBrowseIntent(url);
  keys.forEach(function(id) {
    console.log(' ->', id);
    adbClient.startActivity(id, intent, function(err) {
      if (err) {
        console.log('  -> error', id, err);
      }
    });
  });
}

function rebootPi(sender) {
  console.log('*-*-*-* REBOOT!', sender);
  var now = Date.now();
  var dt = new Date().toLocaleString();
  var ranFor = (Date.now() - clientStartedAt) / 1000;
  var log = {
    date: now,
    dt: dt,
    ranFor: ranFor,
    reason: sender
  };
  fb.child(reportPath + 'rebootLog').push(log);
  fb.child(reportPath + 'rebooting').set(sender);
  var cmd = 'sudo reboot';
  exec(cmd, function(error, stdout, stderr) {});
}

function addDevice(id) {
  console.log('+', id);
  adbClient.startActivity(id, keepScreenOnIntent, function(err) {
    if (err) {
      console.log(' +', id, 'Unable to start KeepScreenOn');
    }
    adbClient.startActivity(id, getBrowseIntent(url));
  });
  deviceIds[id] = true;
  fb.child(reportPath + 'clients/' + id).set(true);
}

function removeDevice(id) {
  console.log('-', id);
  delete deviceIds[id];
  fb.child(reportPath + 'clients/' + id).remove();
}

var adbClient = adb.createClient();
adbClient.trackDevices(function(err, tracker) {
  if (err) {
    console.log('*-*-*-* ADB Client Error', err);
    rebootPi('ADB Client error');
    return;
  }
  tracker.on('add', function(device) {
    addDevice(device.id);
  });
  tracker.on('remove', function(device) {
    removeDevice(device.id);
  });
  tracker.on('change', function(device) {
    if (device.type === 'device') {
      addDevice(device.id);
    } else if (device.type === 'offline') {
      removeDevice(device.id);
    }
  });
});
