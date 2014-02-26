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
    var isAutoSignIn = false;

    this.setIdToken = function(token) {
        idToken = token;
        deviceListController = new DeviceListController(token);
    };

    this.getIdToken = function() {
        return idToken;
    };

    this.setAutoSignIn = function(autoSignIn) {
        isAutoSignIn = autoSignIn;
    };

    this.getAutoSignIn = function() {
        return isAutoSignIn;
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
}

HomeController.prototype.init = function(token, autoSignIn) {
    this.initialiseSendInput();

    this.setIdToken(token);
    this.setAutoSignIn(autoSignIn);

    var logoutBtn = document.querySelector('.nav-bar > .logout');
    logoutBtn.addEventListener('click', function() {
        this.setUIState(SIGN_OUT);
    }.bind(this), true);

    if(typeof token === 'undefined') {
        this.setUIState(SIGN_OUT);
        return;
    }

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
    var appScreens = document.querySelector('.app-screens');

    switch(newState) {
    case LOADING:
        loading.classList.remove('hide');
        emptyLabScreen.classList.add('hide');
        devicelistScreen.classList.add('hide');
        navbar.classList.add('hide');
        appScreens.classList.add('hide');
        break;
    case DEVICE_LIST:
        appScreens.classList.remove('hide');
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
        console.log('Error = '+err);
        // Error
        this.setPlatforms([]);
        this.setUIState(SIGN_OUT);
        if(!err) {
            err = 'Unable to connect to the Device Lab Server.';
        }
        window.alert(err);
    }.bind(this));
};

HomeController.prototype.setupPlatformDevices = function(className, platform) {
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
    var template = document.querySelector('#device-li-template').innerHTML;
    for(var i = 0; i < deviceIds.length; i++) {
        device = deviceListController.getDeviceById(deviceIds[i]);

        var output = Mustache.render(template, device);

        var liElement = document.createElement('li');
        liElement.id = 'device-list-item-'+device.id;
        liElement.innerHTML = output;

        devicelistElem.appendChild(liElement);

        var checkbox = liElement.querySelector('#enabled-checkbox-'+device.id);
        checkbox.checked = device.enabled;

        var deviceList = liElement.querySelector('#device-browser-'+device.id);
        var selectedIndex = device.selectedBrowserIndex;
        if(selectedIndex >= deviceList.childNodes.length) {
            selectedIndex = 0;
        }
        deviceList.childNodes[selectedIndex].classList.remove('deselected');
        deviceList.childNodes[selectedIndex].classList.add('selected');

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
        deviceListController.removeDevice(deviceId, idToken, function(){
            // Success Callback
            window.alert('home-ui-controller.js: Delete Device does nothing');
        }, function() {
            // Error Callback
            window.alert('home-ui-controller.js: Handle delete failure error');
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
            window.alert('home-ui-controller.js: Change device name - does anything need doing?');
        }, function() {
            // Error Callback
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

    this.setupPlatformDevices('android', androidDeviceIds);
    this.setupPlatformDevices('ios', iosDeviceIds);
};

HomeController.prototype.sendURLToDevices = function(url) {
    if(typeof url === undefined || url.length === 0) {
        return;
    }

    var deviceController = this.getDeviceListController();
    deviceController.sendUrlPushMessage(url, function(err) {
        window.alert('Couldn\'t push the URL to devices: '+err);
    });
    //gcmController.sendURLPushMessage(this.getIdToken(), url, deviceParams, function(err) {
    //    window.alert('Unabled to send URL to devices: '+err);
    //});
};
