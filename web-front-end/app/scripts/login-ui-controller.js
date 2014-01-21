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
define(['config', 'strings', 'gplus-identity'], function (config, strings, gplusIdentity) {
    'use strict';

    var LOADING = 0;
    var SIGN_IN = 1;
    var HOME = 2;

    var exports = {};

    var currentState;
    var identityController;
    var idToken;
    var isAutoSignIn = false;

    function setUIState(newState) {
        console.log('login-ui-controller: setUIState = '+newState);
        if(currentState === newState) {
            return;
        }

        var signIn = document.querySelector('.sign-in');
        var loading = document.querySelector('.loading');
        var navbar = document.querySelector('.nav-bar');
        navbar.classList.add('hide');

        switch(newState) {
            case SIGN_IN:
                loading.classList.add('hide');
                signIn.classList.remove('hide');

                break;
            case LOADING:
                loading.classList.remove('hide');
                signIn.classList.add('hide');

                break;
            case HOME:
                if(typeof(idToken) === 'undefined' || idToken === null) {
                    setUIState(SIGN_IN);
                    return;
                }

                loading.classList.remove('hide');
                signIn.classList.add('hide');

                window.location.hash = '#home';
                require(['home-ui-controller'], function(homeController){
                    homeController.init(idToken, isAutoSignIn);
                });
                break;
        }

        currentState = newState;
    }

    exports.init = function() {
        console.log('login-ui-controller: init()');
        identityController = gplusIdentity;

        var signInBtn = document.querySelector('.sign-in > .wrapper > button');
        identityController.initSignInButton(signInBtn, function(token, autoSignIn) {
            idToken = token;
            isAutoSignIn = autoSignIn;
            // Success - Signed In
            setUIState(HOME);
        }, function(errorMsg) {
            /* jshint unused: false */
            
            // Error
            setUIState(SIGN_IN);
        }, function() {
            // Requires Interactive Login
            setUIState(SIGN_IN);
        });

        setUIState(LOADING);
    };

    return exports;
});