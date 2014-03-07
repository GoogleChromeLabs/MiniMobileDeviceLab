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

  this.initialiseSendInput();

  this.setIdToken(token);

  var logoutBtn = document.querySelector('.nav-bar > .logout');
  logoutBtn.addEventListener('click', function() {
    this.setUIState(SIGN_OUT);
  }.bind(this), true);

  this.setUIState(LOADING);

  this.initDeviceList();
};

HomeController.prototype.setUIState = function(newState) {
  var currentState = this.getCurrentState();
  if(currentState === newState) {
    return;
  }

  var loading = document.querySelector('.loading');
  var emptyLabScreen = document.querySelector('.empty-lab');
  var devicelistScreen = document.querySelector('.device-list');
  var navbar = document.querySelector('.nav-bar');
  switch(newState) {
  case LOADING:
    loading.classList.remove('hide');
    emptyLabScreen.classList.add('hide');
    devicelistScreen.classList.add('hide');
    navbar.classList.add('hide');
    break;
  case DEVICE_LIST:
    loading.classList.add('hide');

    var platforms = this.getPlatforms();
    if(platforms.length === 0) {
      navbar.classList.add('hide');
      emptyLabScreen.classList.remove('hide');
      devicelistScreen.classList.add('hide');
    } else {
      navbar.classList.remove('hide');
      emptyLabScreen.classList.add('hide');
      devicelistScreen.classList.remove('hide');

      this.renderDevicesList();
    }

    break;
  case SIGN_OUT:
    loading.classList.remove('hide');
    emptyLabScreen.classList.add('hide');

    gapi.auth.signOut();

    document.cookie = 'token=; autosignin=false; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'autosignin=false; path=/';

    window.location.href = '/';

    break;
  }
  this.setCurrentState(newState);
};

HomeController.prototype.initDeviceList = function() {
  var deviceListController = this.getDeviceListController();
  deviceListController.getPlatformLists(function(platforms) {
    // Success
    this.setPlatforms(platforms);
    this.setUIState(DEVICE_LIST);
  }.bind(this), function(err) {
    // Error
    this.setPlatforms([]);
    this.setUIState(SIGN_OUT);
    if(!err) {
      err = 'Unable to connect to the Device Lab Server.';
    }
    window.alert(err);
  }.bind(this));
};

HomeController.prototype.setupPlatformDevices = function(className, platform, browserModel) {
  var deviceIds = platform === null ? [] : platform.deviceIds;
  var platformEnabled = platform === null ? false : platform.enabled;

  var deviceHeader = document.querySelector('.device-list > .os-header.'+className);
  var devicelistElem = document.querySelector('.device-list > .list-elem.'+className);

  if(typeof deviceIds === 'undefined' || deviceIds === null || deviceIds.length === 0) {
    deviceHeader.classList.add('hide');
    devicelistElem.classList.add('hide');
    return;
  } else {
    deviceHeader.classList.remove('hide');
    devicelistElem.classList.remove('hide');
  }

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

    var browserContainer = liElement.querySelector('.device-browser-selection-container');
    var selectedIndex = device.selectedBrowserIndex;
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

    var checkbox = liElement.querySelector('#enabled-checkbox-'+device.id);
    checkbox.checked = device.enabled;

    var browserList = liElement.querySelector('#device-browser-'+device.id);
    var browserElements = browserList.querySelectorAll('li');

    if(selectedIndex >= browserElements.length) {
      selectedIndex = 0;
    }
    browserElements[selectedIndex].classList.remove('deselected');
    browserElements[selectedIndex].classList.add('selected');

    this.addListElementEvents(liElement, device.id);
  }

  if(platform !== null) {
    var groupEnableCheckbox = document.querySelector('.os-header.'+className+' > .toggle-switch > .checkbox');
    groupEnableCheckbox.checked = platformEnabled;

    if(platformEnabled) {
      devicelistElem.classList.remove('disabled');
    } else {
      devicelistElem.classList.add('disabled');
    }

    var platformId = platform.platformId;
    groupEnableCheckbox.addEventListener('change', function(e){
      var devicelistElem = document.querySelector('.device-list > .list-elem.'+className);
      this.getDeviceListController().onPlatformEnabledChange(platformId, e.target.checked);

      if(e.target.checked) {
        // Android Devices Enabled
        devicelistElem.classList.remove('disabled');
      } else {
        devicelistElem.classList.add('disabled');
      }
    }.bind(this), false);
  }
};

HomeController.prototype.addListElementEvents = function(liElement, deviceId) {
  var deviceList = liElement.querySelector('#device-browser-'+deviceId);
  var browserListItemClickCallback = function(deviceId, index) {
    return function(e) {
      e.preventDefault();

      this.onBrowserSelectionChange(deviceId, index);
    }.bind(this);
  }.bind(this);
  for(var i = 0; i < deviceList.childNodes.length; i++) {
    var browserListItem = deviceList.childNodes[i];
    var index = i;
    browserListItem.addEventListener('click', browserListItemClickCallback(deviceId, index));
  }

  var editButton = document.querySelector('#edit-button-'+deviceId);
  editButton.addEventListener('click', function() {
    var inputField = document.querySelector('#device-name-input-'+deviceId);
    inputField.disabled = false;
    inputField.focus();

    var completeButton = document.querySelector('#complete-button-'+deviceId);
    completeButton.classList.remove('hide');

    editButton.disabled = true;

    var deleteButton = document.querySelector('#delete-button-'+deviceId);
    deleteButton.disabled = true;

    var checkbox = document.querySelector('#enabled-checkbox-'+deviceId);
    checkbox.disabled = true;
  }, true);

  var deleteButton = document.querySelector('#delete-button-'+deviceId);
  deleteButton.addEventListener('click', function() {
    var deviceListController = this.getDeviceListController();
    var idToken = this.getIdToken();
    deviceListController.removeDevice(deviceId, function(){
      // Success Callback
      var listItem = document.querySelector('#device-list-item-'+deviceId);
      listItem.parentNode.removeChild(listItem);
    }, function(err) {
      // Error Callback
      window.alert('This device could not be deleted: '+err);
    });
  }.bind(this), true);

  var completeButton = document.querySelector('#complete-button-'+deviceId);
  completeButton.addEventListener('click', function() {
    var inputField = document.querySelector('#device-name-input-'+deviceId);
    inputField.disabled = true;

    var completeButton = document.querySelector('#complete-button-'+deviceId);
    completeButton.classList.add('hide');

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
  }.bind(this), true);
};

HomeController.prototype.onBrowserSelectionChange = function(deviceId, browserIndex) {
  this.getDeviceListController().setSelectedBrowserIndex(deviceId, browserIndex);

  var browserList = document.querySelector('#device-browser-'+deviceId);
  var currentItem = browserList.querySelector('.selected');
  currentItem.classList.remove('selected');
  currentItem.classList.add('deselected');

  browserList.childNodes[browserIndex].classList.add('selected');
  browserList.childNodes[browserIndex].classList.remove('deselected');
};

HomeController.prototype.initialiseSendInput = function() {
  var inputField = document.querySelector('.url-to-send');
  inputField.onkeyup = function(e) {
    if(Modernizr && Modernizr.localstorage) {
      localStorage.setItem('url-input-field', inputField.value);
    }
  };

  if(Modernizr && Modernizr.localstorage) {
    inputField.value = localStorage.getItem('url-input-field');
  }

  var sendButton = document.querySelector('.send-url');
  sendButton.addEventListener('click', function() {
    var inputField = document.querySelector('.url-to-send');
    this.sendURLToDevices(inputField.value);
  }.bind(this), false);
};

HomeController.prototype.renderDevicesList = function() {
  var platforms = this.getPlatforms();

  var androidDeviceIds = platforms.length > PLATFORM_ID_ANDROID ? platforms[PLATFORM_ID_ANDROID] : null;
  var iosDeviceIds = platforms.length > PLATFORM_ID_IOS ? platforms[PLATFORM_ID_IOS] : null;

  this.setupPlatformDevices('android', androidDeviceIds, new AndroidBrowserModel());
  this.setupPlatformDevices('ios', iosDeviceIds, new IOSBrowserModel());
};

HomeController.prototype.sendURLToDevices = function(url) {
  if(typeof url === undefined || url.length === 0) {
    return;
  }

  var deviceController = this.getDeviceListController();
  deviceController.sendUrlPushMessage(url, function(err) {
    window.alert('Couldn\'t push the URL to devices: '+err);
  });
};

window.onload = function() {
  var homeController = new HomeController();
  homeController.init();
};
