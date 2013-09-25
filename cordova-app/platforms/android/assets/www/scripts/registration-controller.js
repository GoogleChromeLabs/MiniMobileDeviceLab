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