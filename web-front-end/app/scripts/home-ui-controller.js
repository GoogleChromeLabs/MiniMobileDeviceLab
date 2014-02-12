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

/* jshint unused: false */
function HomeController() {
    var deviceListController = new DeviceListController();

    var LOADING = 0;
    var DEVICE_LIST = 1;
    var SIGN_OUT = 2;

    var currentState;
    var devices = {
        android: [],
        ios: []
    };
    var idToken;
    var isAutoSignIn = false;

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

    function setupPlatformDevices(className, platformDevices) {
        var deviceHeader = document.querySelector('.device-list > .os-header.'+className);
        var devicelistElem = document.querySelector('.device-list > .list-elem.'+className);
                    
        var groupEnableCheckbox = document.querySelector('.os-header.'+className+' > .toggle-switch');
        groupEnableCheckbox.addEventListener('change', function(e){
            var devicelistElem = document.querySelector('.device-list > .list-elem.'+className);
            if(e.target.checked) {
                // Android Devices Enabled
                devicelistElem.classList.remove('disabled');
            } else {
                devicelistElem.classList.add('disabled');
            }
        }, false);

        if(typeof platformDevices === 'undefined' || platformDevices === null || platformDevices.length === 0) {
            deviceHeader.classList.add('hide');
            devicelistElem.classList.add('hide');
            return;
        } else {
            deviceHeader.classList.remove('hide');
            devicelistElem.classList.remove('hide');
        }

        var device;

        for(var i = 0; i < platformDevices.length; i++) {
            device = platformDevices[i];

            var liElement = document.createElement('li');
            liElement.id = 'device-list-item-'+device.id;

            var nameInputContainer = document.createElement('div');
            nameInputContainer.id = 'device-name-input-container-'+device.id;
            nameInputContainer.classList.add('device-name-input-container');

            var nameInput = document.createElement('input');
            nameInput.classList.add('device-name-input');
            nameInput.id = 'device-name-input-'+device.id;
            nameInput.value = device.name;
            nameInput.disabled = true;
            nameInputContainer.appendChild(nameInput);

            var completeButton = document.createElement('button');
            completeButton.id = 'complete-button-'+device.id;
            completeButton.classList.add('image-btn');
            completeButton.classList.add('complete-button');
            completeButton.classList.add('hide');
            nameInputContainer.appendChild(completeButton);

            liElement.appendChild(nameInputContainer);

            var enableSpan = document.createElement('span');
            enableSpan.classList.add('toggle-switch');

            var checkbox = document.createElement('input');
            checkbox.id = 'enabled-checkbox-'+device.id;
            checkbox.classList.add('checkbox');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            enableSpan.appendChild(checkbox);

            var label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.classList.add('checkbox-label');
            enableSpan.appendChild(label);

            liElement.appendChild(enableSpan);

            var editButton = document.createElement('button');
            editButton.appendChild(document.createTextNode('Edit'));
            editButton.id = 'edit-button-'+device.id;
            editButton.classList.add('image-btn');
            editButton.classList.add('edit-button');
            liElement.appendChild(editButton);

            var deleteButton = document.createElement('button');
            deleteButton.appendChild(document.createTextNode('Delete'));
            deleteButton.id = 'delete-button-'+device.id;
            deleteButton.classList.add('image-btn');
            deleteButton.classList.add('delete-button');
            liElement.appendChild(deleteButton);

            devicelistElem.appendChild(liElement);

            addListElementEvents(liElement, device.id);
        }
    }

    function setUIState(newState) {
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
                
                if(devices.length === 0) {
                    emptyLabScreen.classList.remove('hide');
                    devicelistScreen.classList.add('hide');
                } else {
                    emptyLabScreen.classList.add('hide');
                    devicelistScreen.classList.remove('hide');

                    setupPlatformDevices('android', devices.android);
                    setupPlatformDevices('ios', devices.ios);
                }
                               
                break;
            case SIGN_OUT:
                loading.classList.remove('hide');
                emptyLabScreen.classList.add('hide');

                gapi.auth.signOut();
                
                break;
        }
        currentState = newState;
    }

    function addListElementEvents(liElement, deviceId) {
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
            deviceListController.removeDevice(deviceId, idToken, function(){
                // Success Callback
                var liElement = document.querySelector('#device-list-item-'+deviceId);
                liElement.parentNode.remove(liElement);
            }, function() {
                // Error Callback
                window.alert('home-ui-controller.js: Handle delete failure error');
            });
        }, true);

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

            deviceListController.changeDeviceName(deviceId, idToken, function(){
                // Success Callback
                window.alert('home-ui-controller.js: Change device name - does anything need doing?');
            }, function() {
                // Error Callback
                window.alert('home-ui-controller.js: Handle device name change error');
            });
        }, true);
    }

    function initialiseSendInput() {
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
            var requestedUrl = inputField.value;

        }, false);
    }

    this.init = function(token, autoSignIn) {
        console.log('home-ui-controller: init() token = '+token);
        initialiseSendInput();

        idToken = token;
        isAutoSignIn = autoSignIn;

        var logoutBtn = document.querySelector('.nav-bar > .logout');
        logoutBtn.addEventListener('click', function() {
            setUIState(SIGN_OUT);
        }, true);

        if(typeof idToken !== 'undefined') {
            setUIState(LOADING);
            deviceListController.getDevices(idToken, function(d) {
                // Success
                devices = d;
                setUIState(DEVICE_LIST);
            }, function() {
                // Error
                setUIState(SIGN_OUT);
                window.alert('Unable to get a list of devices.');
            });
        } else {
            setUIState(SIGN_OUT);
        }
    };

}