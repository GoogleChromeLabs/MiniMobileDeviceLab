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
/*global define */
define(['config', 'device-controller'], function (config, deviceController) {
    'use strict';

    var exports = {};

    exports.registerDeviceWithLab = function(idToken, success, error) {
        if(typeof cordova === "undefined") {
        	success();
        	return;
    	}

        cordova.exec(function(args) {
            // Success Callback
            //success(args.regId);
            console.log('Registration-controller: cordova.exec args.regId = '+args.regId);
            registerWithBackEnd(idToken, args.regId, success, error);
        }, function(err) {
            // Error Callback
            error(err);
        }, "CordovaGCMPlugin", "getRegId", []);
    }

    function registerWithBackEnd(idToken, regId, successCb, errorCb) {
        deviceController.getDevice(function(device) {
            // Success
            var that = this;

            console.log('Registration-controller: registering device = '+config.url+'/devicelab/devices/register/');
            console.log('Registration-controller: regId = '+regId);

            // Use the auth token to do an XHR to get the user information.
            var xhr = new XMLHttpRequest();
            xhr.open('POST', config.url+'/devicelab/devices/register/', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            
            xhr.onreadystatechange = getXHRHandler(device, successCb, errorCb);

            var paramString = 'id_token='+encodeURIComponent(idToken)+
                '&gcm_id='+regId+
                '&device_name='+encodeURIComponent(device.name)+
                '&device_nickname='+encodeURIComponent(device.nickname)+
                '&platform_id='+encodeURIComponent(device.platformId)+
                '&platform_version='+encodeURIComponent(device.platformVersion);
            if(typeof device.deviceId !== 'undefined' && device.deviceId !== null) {
                paramString += '&device_id='+encodeURIComponent(device.deviceId);
            }

            //xhr.setRequestHeader("Content-length", paramString.length);
            xhr.send(paramString);
        }, function(err){
            // Error
        });

        
    }

    function getXHRHandler(device, successCb, errorCb) {
        return function(e) {
            if (this.readyState == 4) {
                if(this.status != 200) {
                    console.log('Registration-controller: xhr error msg = '+this.responseText);
                    errorCb();
                    return;
                } else {
                    console.log('registration-controller: registerDeviceWithLab() xhr.responseText = '+this.responseText);
                    var data = JSON.parse(this.responseText);
                    console.log('registration-controller: Step 1');
                    device.deviceId = data.device_id;
                    console.log('registration-controller: Step 2');
                    successCb(device);
                }
            }
        };
    }

    return exports;
});