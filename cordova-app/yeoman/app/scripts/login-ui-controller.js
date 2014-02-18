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
function LoginController() {

    var LOADING = 0;
    var SIGN_IN = 2;
    var HOME = 3;

    var signInController = new SignInController();
    var regController = new RegistrationController();
    var deviceController = new DeviceController();

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
                window.location.hash = '#home';
                var homeController = new HomeController();
                homeController.init();
                break;
        }

        currentState = newState;
    }

    function registerPushAccount(idToken) {
        regController.registerDeviceWithLab(idToken, function(device) {
            // Success
            console.log('login-ui-controller: Signed In and Device Registered');
            deviceController.saveDevice(device);
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
            var idToken = args['id_token'];
            registerPushAccount(idToken);
        }, function(err) {
            setUIState(SIGN_IN);
            window.alert('An Error Occured While Loading the Page:\n'+err);
        });
    };

    this.init = function() {
        var signInBtn = document.querySelector('.sign-in > .wrapper > button');
        var that = this;
        signInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            that.login();
        }, false);

        setUIState(SIGN_IN);
    };
}