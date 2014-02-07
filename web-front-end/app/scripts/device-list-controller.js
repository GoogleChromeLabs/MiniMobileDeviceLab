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
function DeviceListController() {

    var config = new Config();

    this.getDevices = function(idToken, successCb, errorCb) {
        performDeviceListRequest(idToken, successCb, errorCb);
    };


    function performDeviceListRequest(idToken, successCb, errorCb) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', config.getRootUrl()+'/devicelab/devices/get/', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                if(this.status !== 200) {
                    errorCb();
                    return;
                } else {
                    var data = JSON.parse(xhr.responseText);
                    successCb(data.devices);
                }
            }
        };

        var paramString = 'id_token='+encodeURIComponent(idToken);
        xhr.send(paramString);
    }

    this.removeDevice = function(deviceId, idToken, successCb, errorCb) {
        /* jshint unused: false */
        window.alert('device-list-controller.js: removeDevice() needs implementing');
    };

    this.changeDeviceName = function(deviceId, idToken, successCb, errorCb) {
        /* jshint unused: false */
        window.alert('device-list-controller.js: changeDeviceName() needs implementing');
    };

}