'use strict';

var setupPanel = document.querySelector('setup-panel');

Firebase.goOffline();

var firebase = new Firebase(window.PiLab.config.firebaseUrl);
firebase.authWithCustomToken(window.PiLab.config.firebaseKey, function(error) {
  if (error) {
    throw new Error('Unable to auth with Firebase', error);
  }
});

setupPanel.onConfigClick = function(event) {
  var deviceId = setupPanel.deviceId;
  if (!deviceId) {
    console.log('No device ID found.');
    return;
  }

  var displayType = event.target.dataset.displayTypeId;
  Firebase.goOnline();
  if (displayType === 'default') {
    firebase.child('device-display-types/' + deviceId)
      .remove(function() {
        Firebase.goOffline();
      });
  } else {
    firebase.child('device-display-types/' + deviceId)
      .set(displayType, function() {
        Firebase.goOffline();
      });
  }

  setDisplayTypeUI(displayType);
};

var queryDict = {};
setupPanel.disableBtns = true;
location.hash.substr(1).split('&').forEach(function(item) {queryDict[item.split('=')[0]] = item.split('=')[1]});
if (queryDict && queryDict.deviceId && queryDict.deviceId !== 'undefined') {
  setupPanel.deviceId = queryDict.deviceId;
  setupPanel.disableBtns = false;
} else {
  console.error('Ooops, we really need a device ID here.');
}

setDisplayTypeUI(queryDict.displayTypeId);

function setDisplayTypeUI(displayType) {
  location.hash = 'deviceId=' + setupPanel.deviceId + '&displayTypeId=' + displayType;
}
