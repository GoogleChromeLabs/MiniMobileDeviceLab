'use strict';

var template = document.querySelector('#tmpl');
template.appbarTitle = 'PiLab Config';
template.selected = 'section-device-config';

Firebase.goOffline();

var firebase = new Firebase(window.PiLab.config.firebaseUrl);
firebase.authWithCustomToken(window.PiLab.config.firebaseKey, function(error) {
  if (error) {
    throw new Error('Unable to auth with Firebase', error);
  }
});

template.onConfigClick = function(event) {
  var template = document.querySelector('#tmpl');
  var deviceId = template.deviceId;
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
template.disableBtns = true;
location.hash.substr(1).split('&').forEach(function(item) {queryDict[item.split('=')[0]] = item.split('=')[1]});
console.log(queryDict);
if (queryDict && queryDict.deviceId) {
  template.deviceId = queryDict.deviceId;
  template.disableBtns = false;
} else {
  console.error('Ooops, we really need a device ID here.');
}

var displayTypeId = queryDict.displayTypeId;
template.addEventListener('template-bound', function() {
  setDisplayTypeUI(displayTypeId);
});

function setDisplayTypeUI(displayType) {
  var currentSelectedButtons = document.querySelectorAll('.js-currently-selected');
  for (var i = 0; i < currentSelectedButtons.length; i++) {
    currentSelectedButtons[i].classList.remove('js-currently-selected');
  }

  var displayButton = document.querySelector('[data-display-type-id=\'' + displayType + '\']');
  if (displayButton) {
    displayButton.classList.add('js-currently-selected');
  }

  location.hash = 'deviceId=' + template.deviceId + '&displayTypeId=' + displayType;
}
