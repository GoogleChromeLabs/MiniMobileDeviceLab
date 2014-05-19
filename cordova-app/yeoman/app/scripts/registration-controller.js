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
function RegistrationController() {

    var deviceController = new DeviceController();
    var config = new DeviceLabConfig();

    this.registerDeviceWithLab = function(idToken, success, error) {
        console.log('registerDeviceWithLab()');
        if(typeof gcmlaunchbrowser === 'undefined') {
            error('The GCM Launch Browser plugin hasn\'t been installed');
            return;
        }

        gcmlaunchbrowser.getRegistrationId(function(args) {
            // Success Callback
            registerWithBackEnd(idToken, args.regId, success, error);
        }, function(errMsg) {
            // Error Callback
            if(typeof errMsg === 'undefined' || !errMsg) {
                errMsg = 'An unknown error occurred while setting up push notifications.';
            }
            error(errMsg);
        });
    };

    this.deregisterDevice = function(idToken, deviceId, callback) {
        console.log('deregisterDevice()');
        var xhr = new XMLHttpRequest();
        xhr.open('POST', config.url+'/device/delete/', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function(e) {
            if (e.target.readyState === 4) {
                if(e.target.responseText.length > 0) {
                    var response = JSON.parse(e.target.responseText);
                    if(e.target.status !== 200) {
                        if(response.error.code === 'not_in_database') {
                            callback();
                        } else {
                            callback(response.error.msg);
                        }
                    } else {
                        callback();
                    }
                } else {
                    callback('Sorry, we couldn\'t add your device to the lab, there appears to be a problem with the server.');
                }
            }
        }.bind(this);

        xhr.timeout = 10000;
        xhr.ontimeout = function() {
            callback('Sorry, we couldn\'t add your device to the lab, there appears to be a problem with the server.');
        };

        var paramString = 'id_token='+encodeURIComponent(idToken)+
            '&device_id='+deviceId;

        xhr.send(paramString);
    };

    function registerWithBackEnd(idToken, regId, successCb, errorCb) {
        console.log('registerWithBackEnd()');
        deviceController.getDevice(function(device) {
            // Success Callback
            addDeviceToLab(idToken, regId, device, successCb, errorCb);
        }, function(err){
            /*jshint unused:false*/
            // Error  Callback
            errorCb(err);
        });


    }

    function addDeviceToLab(idToken, regId, device, successCb, errorCb) {
        console.log('addDeviceToLab()');
        var xhr = new XMLHttpRequest();
        xhr.open('POST', config.url+'/devices/add/', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function(e) {
            if (e.target.readyState === 4) {
                if(e.target.responseText.length > 0) {
                    var response = JSON.parse(e.target.responseText);
                    if(e.target.status !== 200) {
                        if(response.error.code === 'already_added') {
                            successCb(device);
                        } else {
                            errorCb(response.error.msg);
                        }
                    } else {
                        console.log('response = ', response);
                        device['device_id'] = response.data['device_id'];
                        successCb(device);
                    }
                } else {
                    errorCb('Sorry, we couldn\'t add your device to the lab, there appears to be a problem with the server.');
                }
            }
        }.bind(this);

        xhr.timeout = 10000;
        xhr.ontimeout = function() {
            errorCb('Sorry, we couldn\'t add your device to the lab, there appears to be a problem with the server.');
        };

        var paramString = 'id_token='+encodeURIComponent(idToken)+
            '&cloud_msg_id='+regId+
            '&device_name='+encodeURIComponent(device.name)+
            '&device_nickname='+encodeURIComponent(device.nickname)+
            '&platform_id='+encodeURIComponent(device.platformId)+
            '&platform_version='+encodeURIComponent(device.platformVersion);
        if(typeof device.deviceId !== 'undefined' && device.deviceId !== null) {
            paramString += '&device_id='+encodeURIComponent(device.deviceId);
        }

        xhr.send(paramString);
    }

}
