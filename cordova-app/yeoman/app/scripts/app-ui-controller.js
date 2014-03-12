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