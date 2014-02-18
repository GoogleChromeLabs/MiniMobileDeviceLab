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

    /**function createBrowserOptions() {
        var sectionElement = document.createElement('section');
        sectionElement.classList.add('device-heading');

        var titleElement = document.createElement('h1');
        titleElement.appendChild(document.createTextNode('Android'));
        sectionElement.appendChild(titleElement);

        var ulElement = document.createElement('ul');
        ulElement.classList.add('browser-options');
        
        var androidBrowsers = androidBrowserModel.getSupportedBrowsers();
        var selectedBrowser = androidBrowserModel.getSelectedBrowser();

        for(var i = 0; i < androidBrowsers.length; i++) {
            var liElement = document.createElement('li');
            
            var icon = document.createElement('img');
            icon.src = androidBrowsers[i].icon;
            
            var name = document.createElement('p');
            name.appendChild(document.createTextNode(androidBrowsers[i].name));

            liElement.appendChild(icon);
            liElement.appendChild(name);

            if(i === selectedBrowser) {
                liElement.classList.add('selected-browser');
            }

            liElement.onclick = onBrowserClickHandler(i);

            ulElement.appendChild(liElement);
        }

        sectionElement.appendChild(ulElement);

        return sectionElement;
    }**/

    /**function onBrowserClickHandler(index) {
        return function(){
            var browserList = document.querySelector('.browser-options');
            var selectedItems = browserList.querySelectorAll('.selected-browser');
            for(var i = 0; i < selectedItems.length; i++) {
                selectedItems[i].classList.remove('selected-browser');
            }

            browserList.children[index].classList.add('selected-browser');

            androidBrowserModel.setSelectedBrowser(index);
        };
    }*/
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
            navbar.classList.remove('hide');
            appScreens.classList.remove('hide');
            loading.classList.add('hide');
            
            var platforms = this.getPlatforms();
            if(platforms.length === 0) {
                emptyLabScreen.classList.remove('hide');
                devicelistScreen.classList.add('hide');
            } else {
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
    }.bind(this), function() {
        // Error
        this.setDeviceGroups([]);
        this.setUIState(DEVICE_LIST);
        window.alert('Unable to get a list of devices.');
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
    for(var i = 0; i < deviceIds.length; i++) {
        device = deviceListController.getDeviceById(deviceIds[i]);

        var liElement = document.createElement('li');
        liElement.id = 'device-list-item-'+device['device_id'];

        var nameInputContainer = document.createElement('div');
        nameInputContainer.id = 'device-name-input-container-'+device['device_id'];
        nameInputContainer.classList.add('device-name-input-container');

        var nameInput = document.createElement('input');
        nameInput.classList.add('device-name-input');
        nameInput.id = 'device-name-input-'+device['device_id'];
        nameInput.value = device['device_nickname'];
        nameInput.disabled = true;
        nameInputContainer.appendChild(nameInput);

        var completeButton = document.createElement('button');
        completeButton.id = 'complete-button-'+device['device_id'];
        completeButton.classList.add('image-btn');
        completeButton.classList.add('complete-button');
        completeButton.classList.add('hide');
        nameInputContainer.appendChild(completeButton);

        liElement.appendChild(nameInputContainer);

        var enableSpan = document.createElement('span');
        enableSpan.classList.add('toggle-switch');

        var checkbox = document.createElement('input');
        checkbox.id = 'enabled-checkbox-'+device['device_id'];
        checkbox.classList.add('checkbox');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        enableSpan.appendChild(checkbox);

        var label = document.createElement('label');
        label.htmlFor = checkbox['device_id'];
        label.classList.add('checkbox-label');
        enableSpan.appendChild(label);

        liElement.appendChild(enableSpan);

        var editButton = document.createElement('button');
        editButton.appendChild(document.createTextNode('Edit'));
        editButton.id = 'edit-button-'+device['device_id'];
        editButton.classList.add('image-btn');
        editButton.classList.add('edit-button');
        liElement.appendChild(editButton);

        var deleteButton = document.createElement('button');
        deleteButton.appendChild(document.createTextNode('Delete'));
        deleteButton.id = 'delete-button-'+device['device_id'];
        deleteButton.classList.add('image-btn');
        deleteButton.classList.add('delete-button');
        liElement.appendChild(deleteButton);

        devicelistElem.appendChild(liElement);

        this.addListElementEvents(liElement, device['device_id']);
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
            //var liElement = document.querySelector('#device-list-item-'+deviceId);
            //liElement.parentNode.remove(liElement);
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
        deviceListController.changeDeviceName(deviceId, this.getIdToken(), function(){
            // Success Callback
            window.alert('home-ui-controller.js: Change device name - does anything need doing?');
        }, function() {
            // Error Callback
            window.alert('home-ui-controller.js: Handle device name change error');
        });
    }.bind(this), true);
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