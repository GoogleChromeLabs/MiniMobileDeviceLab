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
function DeviceController() {

    this.saveDevice = function(device) {
        console.log('hasLocalStorage() = ', hasLocalStorage());
        if(!hasLocalStorage()) {
            return;
        }

        console.log('device = '+device.device_id);

        localStorage.setItem('device_id', device.device_id);
        console.log('localStorage.getItem(\'device_id\') = ', localStorage.getItem('device_id'));
    };

    this.getDevice = function(successCb, errorCb) {
        if(typeof window.device !== 'undefined') {
            console.log('Number 1');
            getFilteredDevice(function(device) {
                var deviceId = this.getDeviceId();
                if(typeof deviceId !== 'undefined' && deviceId !== null) {
                    device.deviceId = deviceId;
                }

                successCb(device);
            }.bind(this), errorCb);
        } else {
            document.addEventListener('deviceready', function() {
                console.log('Number 2');
                getFilteredDevice(function(device) {
                    var deviceId = this.getDeviceId();
                    if(typeof deviceId !== 'undefined' && deviceId !== null) {
                        device.deviceId = deviceId;
                    }

                    successCb(device);
                }.bind(this), errorCb).bind(this);
            }, false);
        }
    };

    this.getDeviceId = function() {
        console.log('hasLocalStorage() = ', hasLocalStorage());
        if(!hasLocalStorage()) {
            return;
        }

        console.log('localStorage.getItem(\'device_id\') = ', localStorage.getItem('device_id'));
        return localStorage.getItem('device_id');
    }

    /* jshint unused: false */
    function getFilteredDevice(successCb, errorCb) {
        console.log(this);
        var devicePlatform = window.device.platform;

        var platformId = -1;
        if(devicePlatform.toLowerCase() === 'android') {
            platformId = 0;
        } else if(devicePlatform.toLowerCase() === 'iphone') {
            platformId = 1;
        }

        if(platformId === -1) {
            errorCb('Tried to register a device which isn\'t Android or iOS');
            return;
        }

        var device = {
            name: window.device.model,
            nickname: getDeviceNickname(),
            platformId: platformId,
            platformVersion: window.device.version,
            uuid: window.device.uuid
        };

        successCb(device);
    }

    function getDeviceNickname() {
        if(!hasLocalStorage()) {
            return window.device.model;
        }

        var nickname = localStorage.getItem('device-nickname');
        if(typeof nickname === 'undefined' || nickname === null) {
            nickname = window.device.model;
        }
        return nickname;
    }

    function hasLocalStorage() {
        return Modernizr && Modernizr.localstorage;
    }

}