/*global define */
define([], function () {
    'use strict';

    var exports = {};

    exports.saveDevice = function(device) {
        if(!(Modernizr && Modernizr.localstorage)) {
            return;
        }

        localStorage.setItem("device-id", device.deviceId);
    }

    exports.getDevice = function(successCb, errorCb) {
        if(typeof window.device !== 'undefined') {
            getFilteredDevice(successCb, errorCb);
        } else {
            document.addEventListener("deviceready", function() {
                console.log('Device-Controller: Device is Ready');
                getFilteredDevice(successCb, errorCb);
            }, false);
        }
    }

    function getFilteredDevice(successCb, errorCb) {
        var devicePlatform = window.device.platform;

        var platformId = -1;
        if(devicePlatform.toLowerCase() === 'android') {
            platformId = 0;
        } else if(devicePlatform.toLowerCase() === 'iphone') {
            platformId = 1;
        }

        if(platformId === -1) {
            console.log('Tried to register a device which isn\'t android or iPhone!?!?');
            return;
        }

        var device = {
            name: window.device.model,
            nickname: getDeviceNickname(),
            platformId: platformId,
            platformVersion: window.device.version,
            uuid: window.device.uuid
        };

        var deviceId = getDeviceId();
        if(typeof deviceId !== 'undefined' && deviceId !== null) {
            device.deviceId = deviceId;
        }

        successCb(device);
    }

    function getDeviceId() {
        if(!(Modernizr && Modernizr.localstorage)) {
            return;
        }

        return localStorage.getItem("device-id");
    }

    function getDeviceNickname() {
        if(!(Modernizr && Modernizr.localstorage)) {
            return window.device.model;
        }

        return localStorage.getItem("device-nickname");
    }


    return exports;
});