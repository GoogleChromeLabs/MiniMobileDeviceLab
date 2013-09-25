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
/*global define */
define(['strings'], function (strings) {
    'use strict';

    var HOME = 0;
    var LOADING = 1;
    var LOGIN = 2;

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
            case HOME:
                return 'home';
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
            case HOME:
                mainContentElement.appendChild(getTitleElement(strings.home_title));

                for(var i = 0; i < strings.home_msgs.length; i++) {
                    var pElement = document.createElement('p');
                    pElement.appendChild(document.createTextNode(strings.home_msgs[i]));
                    mainContentElement.appendChild(pElement);
                }

                var logOutButton = document.createElement('a');
                logOutButton.classList.add('log-out-button');
                logOutButton.appendChild(document.createTextNode(strings.log_out));
                logOutButton.href= "#logout";
                logOutButton.onclick = function(e){
                    history.pushState(null, null, logOutButton.href);
                    e.preventDefault();
                    exports.logout();
                }
                mainContentElement.appendChild(logOutButton);
                break;
            case LOADING:
                element = document.createElement('div');
                element.classList.add('spinner');
                break;
            case LOGIN:
                window.location.hash = '';
                require(['login-ui-controller'], function(loginController){
                    loginController.init();
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

    exports.logout = function() {
        setUIState(LOGIN);
    }

    exports.init = function() {
        setUIState(HOME);
    }

    return exports;
});