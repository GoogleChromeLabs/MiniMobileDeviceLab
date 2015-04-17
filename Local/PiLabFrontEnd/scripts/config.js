'use strict';

var template = document.querySelector('#tmpl');
template.appbarTitle = 'PiLab Config';
template.selected = 'section-device-config';

template.onConfigClick = function(event) {
  var template = document.querySelector('#tmpl');
  var deviceId = template.deviceId;
  if (!deviceId) {
    console.log('No device ID found.');
    return;
  }

  var displayType = event.target.dataset.displayTypeId;
  if (displayType === 'default') {
    firebase.child('device-display-types/' + deviceId).remove();
  } else {
    firebase.child('device-display-types/' + deviceId).set(displayType);
  }
};

var queryDict = {};
template.disableBtns = true;
location.search.substr(1).split('&').forEach(function(item) {queryDict[item.split('=')[0]] = item.split('=')[1]});
if (queryDict && queryDict.deviceId) {
  template.deviceId = queryDict.deviceId;
} else {
  console.error('Ooops, we really need a device ID here.');
}

var firebase = new Firebase('https://goog-lon-device-lab.firebaseio.com/');
firebase.authWithCustomToken('vdRwF7OBMMhMvtxxETmqvcpdM9JztAFrR7Qlx5yZ', function(error) {
  if (error) {
    throw new Error('Unable to auth with Firebase', error);
  }

  firebase.child('device-display-types/' + template.deviceId).on('value', function(snapshot) {
    var displayTypeId = snapshot.val();
    if (!displayTypeId) {
      displayTypeId = 'default';
    }
    console.log(displayTypeId);
    var currentSelectedButtons = document.querySelectorAll('.js-currently-selected');
    for (var i = 0; i < currentSelectedButtons.length; i++) {
      currentSelectedButtons[i].classList.remove('js-currently-selected');
    }

    var displayButton = document.querySelector('[data-display-type-id=\'' + displayTypeId + '\']');
    displayButton.classList.add('js-currently-selected');
  });

  if (template.deviceId) {
    template.disableBtns = false;
  }
});
