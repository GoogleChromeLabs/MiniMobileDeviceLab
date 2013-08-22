/*global define */
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