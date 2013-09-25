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
define(['config', 'sign-in-controller', 'registration-controller', 'strings', 'device-controller'], function (config, signInController, regController, strings, deviceController) {
    'use strict';

    var LOADING = 0;
    var SIGN_IN = 2;
    var HOME = 3;

    var exports = {};

    var currentState;
    var mainContentElement = document.getElementById('main-content');

    function clearUpCurrentStateUI() {
        var childNode = mainContentElement.firstChild;

        while(childNode) {
            mainContentElement.removeChild(childNode);
            childNode = mainContentElement.firstChild;
        }

        var currentClassName = getStateClass(currentState);
        if(currentClassName != null) {
            mainContentElement.classList.remove(currentClassName);
        }
    }

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

    function getTitleElement(title) {
        var headerSection = document.createElement('header');
        var titleElement = document.createElement('h1');
        titleElement.innerHTML = title;
        headerSection.appendChild(titleElement);
        return headerSection;
    }

    function setUIState(newState) {
        if(currentState == newState) {
            return;
        }

        clearUpCurrentStateUI();

        var element;
        var stateClassName = getStateClass(newState);
        switch(newState) {
            case SIGN_IN:
                mainContentElement.appendChild(getTitleElement(strings.welcome_title));

                for(var i = 0; i < strings.welcome_msgs.length; i++) {
                    var pElement = document.createElement('p');
                    pElement.appendChild(document.createTextNode(strings.welcome_msgs[i]));
                    mainContentElement.appendChild(pElement);
                }

                var signInButton = document.createElement('a');
                signInButton.classList.add('sign-in-button');
                signInButton.appendChild(document.createTextNode(strings.sign_in));
                signInButton.href= "#signin";
                signInButton.onclick = function(e){
                    history.pushState(null, null, signInButton.href);
                    e.preventDefault();
                    exports.login();
                }
                mainContentElement.appendChild(signInButton);
                break;
            case LOADING:
                element = document.createElement('div');
                element.classList.add('spinner');
                break;
            case HOME:
                window.location.hash = '#home';
                require(['home-ui-controller'], function(homeController){
                    homeController.init();
                });
                break;
        }

        if(stateClassName != null) {
            mainContentElement.classList.add(stateClassName);
        }

        if(element) {
            mainContentElement.appendChild(element);
        }
        currentState = newState;
    }

    function registerPushAccount(idToken) {
        regController.registerDeviceWithLab(idToken, function(device) {
            // Success
            deviceController.saveDevice(device);
            setUIState(HOME);
        }, function(){
            // Error
            console.log('Error regristering for push notifications');
        });
    }

    exports.login = function () {
        setUIState(LOADING);
        signInController.loginInToGPlus(function(args) {
            var idToken = args.id_token;
            registerPushAccount(idToken);
        }, function(err) {
            console.log('login-ui-controller.js: Error at login(): '+err);
        });
    }

    exports.init = function() {
        setUIState(SIGN_IN);
    }

    return exports;
});