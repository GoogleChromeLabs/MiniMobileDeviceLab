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
define(['config'], function (config) {
    'use strict';

    var exports = {};

    exports.sendUrlPushMessage = function(idToken, url, devices, browserOptions) {
        console.log('gcm-controller: sendPushMessageUrl() url = '+url);

    	var xhr = new XMLHttpRequest();
        xhr.open('POST', config.getRootUrl()+'/devicelab/pushmsg/url/', true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        var that = this;
        xhr.onreadystatechange = function(e) {
            console.log('gcm-controller: sendPushMessageUrl() onreadystatechange');
            if (this.readyState == 4) {
                console.log('gcm-controller: sendPushMessageUrl() readyState == 4');
                if(this.status != 200) {
                    console.log('gcm-controller: sendPushMessageUrl() error() '+xhr.responseText);
                    //errorCb();
                    return;
                } else {
                    console.log('gcm-controller: sendPushMessageUrl() xhr.responseText = '+xhr.responseText);
                    //var data = JSON.parse(xhr.responseText);
                    //successCb(data.devices);
                }
            }
        };

        var deviceIds = [];
        for(var i = 0; i < devices.length; i++) {
            deviceIds[i] = devices[i].id;
        }

        var params = {
            id_token: idToken,
            url: url,
            browser_options: browserOptions,
            devices: deviceIds
        };

        var paramString = JSON.stringify(params);
        xhr.send(paramString);
    }

    return exports;
});