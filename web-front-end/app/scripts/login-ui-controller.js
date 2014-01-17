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
    var controller;
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
        if(currentState === newState) {
            return;
        }

        //clearUpCurrentStateUI();

        var element;
        var stateClassName = getStateClass(newState);
        switch(newState) {
            case SIGN_IN:
                //var spinner = document.createElement('div');
                //spinner.classList.add('spinner');
                //mainContentElement.appendChild(spinner);

                //var signInWrapper = document.createElement('section');
                //signInWrapper.classList.add('sign-in-wrapper');
                //signInWrapper.style.display = 'none';
                //signInWrapper.appendChild(getTitleElement(strings.welcome_title));

                var signInWrapper = document.querySelector('.sign-in > .wrapper');
                var signInBtn = signInWrapper.querySelector('button');

                //for(var i = 0; i < strings.welcome_msgs.length; i++) {
                //    var pElement = document.createElement('p');
                //    pElement.appendChild(document.createTextNode(strings.welcome_msgs[i]));
                //    signInWrapper.appendChild(pElement);
                //}

                controller.initSignInButton(signInBtn, function(token, autoSignIn) {
                    idToken = token;
                    isAutoSignIn = autoSignIn;
                    // Success - Signed In
                    setUIState(HOME);
                }, function(errorMsg) {
                    // Error
                    console.log('login-ui-controller - error on signing in '+errorMsg);
                }, function() {
                    //var spinner = document.querySelector('.loading');
                    //var signInWrapper = document.querySelector('.sign-in');

                    //spinner.style.display = 'none';
                    //signInWrapper.style.display = 'block';
                });

                //mainContentElement.appendChild(signInWrapper);
                break;
            case LOADING:
                element = document.createElement('div');
                element.classList.add('spinner');
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
        controller = gplusIdentity;

        setUIState(SIGN_IN);
    };

    return exports;
});