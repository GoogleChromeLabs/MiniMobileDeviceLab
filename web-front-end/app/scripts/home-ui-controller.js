/**
Copyright 2013 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
'use strict';

var PLATFORM_ID_ANDROID = 0;
var PLATFORM_ID_IOS = 1;

var LOADING = 0;
var DEVICE_LIST = 1;
var SIGN_OUT = 2;

/* jshint unused: false, sub:true */
function HomeController() {
  var deviceListController = null;

  var currentState;
  var platforms = [];
  var idToken;

  this.setIdToken = function(token) {
    idToken = token;
    deviceListController = new DeviceListController(token);
  };

  this.getIdToken = function() {
    return idToken;
  };

  this.getCurrentState = function() {
    return currentState;
  };

  this.setCurrentState = function(state) {
    currentState = state;
  };

  this.getDeviceListController = function() {
    return deviceListController;
  };

  this.setPlatforms = function(p) {
    platforms = p;
  };

  this.getPlatforms = function() {
    return platforms;
  };

  this.getFriendlyCookie = function() {
    var keyValueStrings = document.cookie.split(';');
    var friendlyCookie = {};
    for(var i=0; i < keyValueStrings.length; i++)  {
      var attribute = keyValueStrings[i].trim().split('=');
      if(attribute.length !== 2) {
        continue;
      }

      friendlyCookie[attribute[0]] = attribute[1];
    }

    return friendlyCookie;
  };
}

HomeController.prototype.init = function() {
  var cookie = this.getFriendlyCookie();
  var token = cookie.token;
  if(typeof token === 'undefined') {
    this.setUIState(SIGN_OUT);
    return;
  }
  this.setIdToken(token);

  this.initialiseStaticElements();

  this.setUIState(LOADING);

  this.updateDeviceList(function() {
    this.setUIState(DEVICE_LIST);
  }.bind(this));
};

/**
 * Set the UI state for the page
 */
HomeController.prototype.setUIState = function(newState) {
  var currentState = this.getCurrentState();
  //if(currentState === newState) {
  //  return;
  //}

  // Iterate over the dom elements and show / hide depending on the state
  var classList = ['loading', 'empty-lab', 'device-list', 'nav-bar'];
  var visible = {};

  switch(newState) {
  case LOADING:
    visible['loading'] = true;
    break;
  case DEVICE_LIST:
    var platforms = this.getPlatforms();
    if(platforms.length === 0) {
      visible['empty-lab'] = true;
    } else {
      visible['nav-bar'] = true;
      visible['device-list'] = true;

      this.renderDevicesList();
    }

    break;
  case SIGN_OUT:
    gapi.auth.signOut();

    document.cookie = 'token=; autosignin=false; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'autosignin=false; path=/';

    window.location.href = '/';

    break;
  }

  this.alterVisibleViews(visible, classList);

  this.setCurrentState(newState);
};

/**
 * This method goes through the class names in the classList array and if
 * the visible object has a key of the className with value true, it will
 * have the 'hide' className removed, otherwise it's added
 */
HomeController.prototype.alterVisibleViews = function(visible, classList) {
  for(var i = 0; i < classList.length; i++) {
    var className = classList[i];
    var element = document.querySelector('.'+className);
    if(!element) {
      continue;
    }

    if(visible[className]) {
      element.classList.remove('hide');
    } else {
      element.classList.add('hide');
    }
  }
};

/**
 * Initialise any elements on the page which aren't going to change
 * during the use of the page
 */
HomeController.prototype.initialiseStaticElements = function() {
  var inputField = document.querySelector('.url-to-send');

  // Stash the value on keyup
  inputField.onkeyup = function(e) {
    if(Modernizr && Modernizr.localstorage) {
      localStorage.setItem('url-input-field', inputField.value);
    }
  };

  // Set the input value to our stashed value
  if(Modernizr && Modernizr.localstorage) {
    inputField.value = localStorage.getItem('url-input-field');
  }

  // On send button press, send the push message
  var sendButton = document.querySelector('.send-url');
  sendButton.addEventListener('click', function() {
    this.sendURLToDevices(document.querySelector('.url-to-send').value);
  }.bind(this), false);

  // On log out set the UI state accordingly
  var logoutBtn = document.querySelector('.nav-bar > .logout');
  if(logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      this.setUIState(SIGN_OUT);
    }.bind(this), true);
  }
};

/**
 * Get the device list from the model
 */
HomeController.prototype.updateDeviceList = function(successCb) {
  var deviceListController = this.getDeviceListController();
  deviceListController.getPlatformLists(function(err, platforms) {
    if(err !== null) {
      window.alert(err);

      this.setUIState(SIGN_OUT);
      return;
    }

    console.log('platforms = ', platforms);

    this.setPlatforms(platforms);
    successCb();
  }.bind(this));
};

/**
 * This method will send the url to all devices
 */
HomeController.prototype.sendURLToDevices = function(url) {
  if(typeof url === undefined || url.length === 0) {
    return;
  }

  var deviceController = this.getDeviceListController();
  deviceController.sendUrlPushMessage(url, function(err) {
    window.alert('Couldn\'t push the URL to devices: '+err);
  });
};

/**
 * Given we have the devices, group them into platforms and
 * query accordingly
 */
HomeController.prototype.renderDevicesList = function() {
  var platforms = this.getPlatforms();

  var androidDeviceIds = platforms.length > PLATFORM_ID_ANDROID ? platforms[PLATFORM_ID_ANDROID] : null;
  var iosDeviceIds = platforms.length > PLATFORM_ID_IOS ? platforms[PLATFORM_ID_IOS] : null;

  this.setupPlatformDevices('android', androidDeviceIds, new AndroidBrowserModel());
  this.setupPlatformDevices('ios', iosDeviceIds, new IOSBrowserModel());
};

/**
 * Set up a specific platforms device list
 */
HomeController.prototype.setupPlatformDevices = function(className, platform, browserModel) {
  var deviceIds = platform === null ? [] : platform.deviceIds;
  var platformEnabled = platform === null ? false : platform.enabled;

  // Hide or show the platform sections
  var deviceHeader = document.querySelector('.device-list > .os-header.'+className);
  var devicelistElem = document.querySelector('.device-list > .list-elem.'+className);
  if(typeof deviceIds === 'undefined' || deviceIds === null || deviceIds.length === 0) {
    deviceHeader.classList.add('hide');
    devicelistElem.classList.add('hide');
    return;
  }

  deviceHeader.classList.remove('hide');
  devicelistElem.classList.remove('hide');

  this.prepareDeviceList(devicelistElem, deviceIds, browserModel);
  this.prepareDeviceGroupState(className, platform.platformId, platformEnabled);

};

/**
 * Get the device list populated with relevant browser options
 */
HomeController.prototype.prepareDeviceList = function(devicelistElem,
  deviceIds, browserModel) {
  var device;
  var deviceListController = this.getDeviceListController();
  var deviceRowTemplate = document.querySelector('#device-li-template').innerHTML;
  var browserSelectTemplate = document.querySelector('#browser-li-template').innerHTML;
  var browserArray = browserModel.getBrowsers();

  for(var i = 0; i < deviceIds.length; i++) {
    device = deviceListController.getDeviceById(deviceIds[i]);

    // Create Entry for the Device
    var output = Mustache.render(deviceRowTemplate, device);
    var liElement = document.createElement('li');
    liElement.id = 'device-list-item-'+device.id;
    liElement.innerHTML = output;
    devicelistElem.appendChild(liElement);

    // Create browser list element
    var browserContainer = liElement.querySelector('.device-browser-selection-container');
    var selectedIndex = device.selectedBrowserIndex;
    if(selectedIndex >= browserArray.length) {
      selectedIndex = 0;
    }

    // Add each browser element
    for(var j = 0; j < browserArray.length; j++) {
      output = Mustache.render(browserSelectTemplate, browserArray[j]);
      var browserLiElement = document.createElement('li');
      browserLiElement.innerHTML = output;
      browserContainer.appendChild(browserLiElement);

      if(j === selectedIndex) {
        browserLiElement.classList.add('selected');
      } else {
        browserLiElement.classList.add('deselected');
      }
    }

    // If the element is enabled or not
    var checkbox = liElement.querySelector('#enabled-checkbox-'+device.id);
    checkbox.checked = device.enabled;

    if(!device.enabled) {
      liElement.classList.add('disabled');
    }

    this.addListElementEvents(liElement, device.id);
  }
};

/**
 * Prepare the device group to handle toggling of the enabled checkbox and
 * also set it to the previous state is known
 */
HomeController.prototype.prepareDeviceGroupState = function(className,
  platformId, enabled) {

  // Set the checkbox state
  var groupEnableCheckbox = document.querySelector('.os-header.'+className+' > .toggle-switch > .checkbox');
  groupEnableCheckbox.checked = enabled;

  // Add change listener to the checkbox to handle disabling / enabling
  groupEnableCheckbox.addEventListener('change', function(e){
    var devicelistElem = document.querySelector('.device-list > .list-elem.'+className);
    this.getDeviceListController().onPlatformEnabledChange(platformId, e.target.checked);

    if(e.target.checked) {
      devicelistElem.classList.remove('disabled');
    } else {
      devicelistElem.classList.add('disabled');
    }
  }.bind(this), false);

  // Set the device list to be disabled or not
  var devicelistElem = document.querySelector('.device-list > .list-elem.'+className);
  if(enabled) {
    devicelistElem.classList.remove('disabled');
  } else {
    devicelistElem.classList.add('disabled');
  }
};

HomeController.prototype.addListElementEvents = function(liElement, deviceId) {
  var deviceList = liElement.querySelector('#device-browser-'+deviceId);

  // For each mobile device, add a click listener to each browser option
  for(var i = 0; i < deviceList.childNodes.length; i++) {
    var browserListItem = deviceList.childNodes[i];
    var index = i;

    browserListItem.addEventListener('click',
      this.getBrowserSelectionCb(deviceId, index), true);
  }

  // Handle the edit text element
  var editButton = document.querySelector('#edit-button-'+deviceId);
  editButton.addEventListener('click',
    this.getEditDeviceCallback(deviceId), true);

  // Handle the complete text element
  var completeButton = document.querySelector('#complete-button-'+deviceId);
  completeButton.addEventListener('click',
    this.getCompleteEditCallback(deviceId), true);

  // Handle the delete device action
  var deleteButton = document.querySelector('#delete-button-'+deviceId);
  deleteButton.addEventListener('click',
    this.getDeleteDeviceCallback(deviceId), true);

  // Handle the delete device action
  var enabledCheckbox = document.querySelector('#enabled-checkbox-'+deviceId);
  enabledCheckbox.addEventListener('change',
    this.getEnableDeviceCallback(deviceId), true);
};

/**
 * Get a callback to handle a browser selection
 */
HomeController.prototype.getBrowserSelectionCb = function(deviceId, index) {
  return function(e) {
    e.preventDefault();

    this.onBrowserSelectionChange(deviceId, index);
  }.bind(this);
};

/**
 * A callback to edit a device (at the moment only handles nickname changes)
 */
HomeController.prototype.getEditDeviceCallback = function(deviceId) {
  return function() {
    var inputField = document.querySelector('#device-name-input-'+deviceId);
    inputField.disabled = false;
    inputField.focus();

    var completeButton = document.querySelector('#complete-button-'+deviceId);
    completeButton.classList.remove('hide');

    var editButton = document.querySelector('#edit-button-'+deviceId);
    editButton.disabled = true;

    var deleteButton = document.querySelector('#delete-button-'+deviceId);
    deleteButton.disabled = true;

    var checkbox = document.querySelector('#enabled-checkbox-'+deviceId);
    checkbox.disabled = true;
  };
};

/**
 * A callback to handle deleting a device
 */
HomeController.prototype.getDeleteDeviceCallback = function(deviceId) {
  return function() {
    var deviceListController = this.getDeviceListController();
    var idToken = this.getIdToken();
    deviceListController.removeDevice(deviceId, function(){
      // Success Callback
      var listItem = document.querySelector('#device-list-item-'+deviceId);
      listItem.parentNode.removeChild(listItem);

      this.updateDeviceList(function() {
        var platforms = this.getPlatforms();
        if(platforms.length === 0) {
          this.setUIState(DEVICE_LIST);
        }
      }.bind(this));
    }.bind(this), function(err) {
      // Error Callback
      window.alert('This device could not be deleted: '+err);
    });
  }.bind(this);
};

/**
 * A callback to handle completion of device editing
 */
HomeController.prototype.getCompleteEditCallback = function(deviceId) {
  return function() {
    var inputField = document.querySelector('#device-name-input-'+deviceId);
    inputField.disabled = true;

    var completeButton = document.querySelector('#complete-button-'+deviceId);
    completeButton.classList.add('hide');

    var editButton = document.querySelector('#edit-button-'+deviceId);
    editButton.disabled = false;

    var deleteButton = document.querySelector('#delete-button-'+deviceId);
    deleteButton.disabled = false;

    var checkbox = document.querySelector('#enabled-checkbox-'+deviceId);
    checkbox.disabled = false;

    var deviceListController = this.getDeviceListController();
    deviceListController.changeDeviceNickName(deviceId, inputField.value, function(){
      // Success Callback
      //window.alert('home-ui-controller.js: Change device name - does anything need doing?');
    }, function() {
      // Error Callback
      var nickname = this.getDeviceListController().getDeviceById(deviceId)['device_nickname'];
      var inputField = document.querySelector('#device-name-input-'+deviceId);
      inputField.value = nickname;

      window.alert('home-ui-controller.js: Handle device name change error');
    });
  }.bind(this);
};

/**
 * A callback to handle completion of device editing
 */
HomeController.prototype.getEnableDeviceCallback = function(deviceId) {
  return function(e) {
    var deviceListItem = document.querySelector('#device-list-item-'+deviceId);

    this.getDeviceListController().onDeviceEnabledChange(deviceId, e.target.checked);

    if(e.target.checked) {
      deviceListItem.classList.remove('disabled');
    } else {
      deviceListItem.classList.add('disabled');
    }
  }.bind(this);
};

/**
 * Handle a browser selection (set / save state) and
 */
HomeController.prototype.onBrowserSelectionChange = function(deviceId, browserIndex) {
  this.getDeviceListController().setSelectedBrowserIndex(deviceId, browserIndex);

  var browserList = document.querySelector('#device-browser-'+deviceId);
  var currentItem = browserList.querySelector('.selected');
  currentItem.classList.remove('selected');
  currentItem.classList.add('deselected');

  browserList.childNodes[browserIndex].classList.add('selected');
  browserList.childNodes[browserIndex].classList.remove('deselected');
};

window.onload = function() {
  var homeController = new HomeController();
  homeController.init();
};
