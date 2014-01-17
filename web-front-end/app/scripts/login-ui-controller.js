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
    //var mainContentElement;// = document.querySelector('.sign-in');
    var identityController;
    var idToken;
    var isAutoSignIn = false;

    /**function clearUpCurrentStateUI() {
        var childNode = mainContentElement.firstChild;

        while(childNode) {
            mainContentElement.removeChild(childNode);
            childNode = mainContentElement.firstChild;
        }

        var currentClassName = getStateClass(currentState);
        if(currentClassName != null) {
            mainContentElement.classList.remove(currentClassName);
        }
    }**/

    function getStateClass(state) {
        switch(state) {
            case SIGN_IN:
                return 'sign-in';
            case LOADING:
                return 'loading';
            default:
                return null;
        }
    }

    function setUIState(newState) {
        console.log('setUIState = '+newState);
        if(currentState === newState) {
            return;
        }

        //clearUpCurrentStateUI();

        var signIn = document.querySelector('.sign-in');
        var loading = document.querySelector('.loading');

        var element;
        var stateClassName = getStateClass(newState);
        switch(newState) {
            case SIGN_IN:
                loading.style.visibility = 'hidden';
                signIn.style.visibility = 'visible';

                //mainContentElement.appendChild(signInWrapper);
                break;
            case LOADING:
                loading.style.visibility = 'visible';
                signIn.style.visibility = 'hidden';
                break;
            case HOME:
                if(typeof(idToken) === 'undefined' || idToken === null) {
                    setUIState(SIGN_IN);
                    return;
                }

                window.location.hash = '#home';
                require(['home-ui-controller'], function(homeController){
                    homeController.init(idToken, isAutoSignIn);
                });
                break;
        }

        if(stateClassName !== null) {
            //mainContentElement.classList.add(stateClassName);
        }

        if(element) {
            //mainContentElement.appendChild(element);
        }
        currentState = newState;
    }

    exports.init = function() {
        identityController = gplusIdentity;

        var signInBtn = document.querySelector('.sign-in > .wrapper > button');
        identityController.initSignInButton(signInBtn, function(token, autoSignIn) {
            idToken = token;
            isAutoSignIn = autoSignIn;
            // Success - Signed In
            setUIState(HOME);
        }, function(errorMsg) {
            // Error
            console.log('login-ui-controller - error on signing in '+errorMsg);
            setUIState(SIGN_IN);
        }, function() {
            // Requires Interactive Login
            setUIState(SIGN_IN);
        });

        setUIState(LOADING);
    };

    return exports;
});