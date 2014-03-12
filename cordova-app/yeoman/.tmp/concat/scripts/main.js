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

/* jshint unused: false */
'use strict';

function DeviceLabConfig() {
    this.url = 'http://192.168.1.40:3000';
}

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
        console.log(idToken, deviceId);
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
function SignInController() {
    
    this.loginInToGPlus = function(success, error) {
        if(typeof cordova === 'undefined') {
            error('Cordova isn\'t available to the page');
            return;
        }

        if(typeof nativegplussignin === 'undefined') {
            error('The NativeGPlusSignIn plugin isn\'t loaded into the page');
            return;
        }

        nativegplussignin.login(function(args) {
            // Success
            success(args);
        }, function(errMsg) {
            // Error
            error(errMsg);
        });
        
    };

}
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
function AppController() {

    var LOADING = 0;
    var SIGN_IN = 1;
    var HOME = 2;

    var signInController = new SignInController();
    var regController = new RegistrationController();
    var deviceController = new DeviceController();

    var idToken;
    var currentState;

    function setUIState(newState) {
        if(currentState === newState) {
            return;
        }

        var signIn = document.querySelector('.sign-in');
        var loading = document.querySelector('.loading');
        var home = document.querySelector('.home');

        switch(newState) {
            case SIGN_IN:
                loading.classList.add('hide');
                home.classList.add('hide');
                signIn.classList.remove('hide');
                break;
            case LOADING:
                loading.classList.remove('hide');
                signIn.classList.add('hide');
                home.classList.add('hide');
                break;
            case HOME:
                loading.classList.add('hide');
                signIn.classList.add('hide');
                home.classList.remove('hide');
                break;
        }

        currentState = newState;
    }

    function registerPushAccount(idToken) {
        regController.registerDeviceWithLab(idToken, function(device) {
            // Success

            // If the device is already registered, we won't receive a new device ID
            // i.e. no device id means we've just signed in
            if(device['device_id']) {
                deviceController.saveDevice(device);
            }
            setUIState(HOME);
        }, function(errorMsg){
            // Error
            setUIState(SIGN_IN);
            window.alert('Error registering your device for push notifications:\n'+errorMsg);
        });
    }

    this.login = function () {
        setUIState(LOADING);
        signInController.loginInToGPlus(function(args) {
            /*jshint sub:true*/
            idToken = args['id_token'];
            registerPushAccount(idToken);
        }, function(err) {
            setUIState(SIGN_IN);
            window.alert('An Error Occured While Loading the Page:\n'+err);
        });
    };

    this.deregisterDevice = function() {
        setUIState(LOADING);
        regController.deregisterDevice(idToken, deviceController.getDeviceId(), 
            function(err) {
                if(err) {
                    window.alert(err);
                    setUIState(HOME);
                    return;
                }

                setUIState(SIGN_IN);
            });
    };

    this.init = function() {
        var signInBtn = document.querySelector('.sign-in > .wrapper > button');
        signInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            this.login();
        }.bind(this), false);

        var deregisterDeviceBtn = document.querySelector('.home > .wrapper > button');
        deregisterDeviceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            this.deregisterDevice();
        }.bind(this), false);

        setUIState(SIGN_IN);
    };
}
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

if(typeof cordova !== 'undefined') {
    document.addEventListener('deviceready', function() {
        var appController = new AppController();
    	appController.init();
    }, false);
} else {
    console.log('Cordova is not loaded');
}