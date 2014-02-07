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
function HomeController() {

    var HOME = 0;
    var LOADING = 1;
    var LOGIN = 2;

    var currentState;

    /**function clearUpCurrentStateUI() {
        var childNode = mainContentElement.firstChild;

        while(childNode) {
            mainContentElement.removeChild(childNode);
            childNode = mainContentElement.firstChild;
        }

        var currentClassName = getStateClass(currentState);
        if(currentClassName !== null) {
            mainContentElement.classList.remove(currentClassName);
        }
    }**/

    /**function getStateClass(state) {
        switch(state) {
            case HOME:
                return 'home';
            case LOADING:
                return 'loading';
            default:
                return null;
        }
    }**/

    /**function getTitleElement(title) {
        var headerSection = document.createElement('header');
        var titleElement = document.createElement('h1');
        titleElement.innerHTML = title;
        headerSection.appendChild(titleElement);
        return headerSection;
    }**/

    function setUIState(newState) {
        if(currentState === newState) {
            return;
        }

        var signIn = document.querySelector('.sign-in');
        var home = document.querySelector('.home');
        var loading = document.querySelector('.loading');

        switch(newState) {
            case HOME:
                loading.classList.add('hide');
                signIn.classList.add('hide');
                home.classList.remove('hide');
                //mainContentElement.appendChild(getTitleElement(strings.homeTitle));

                /**for(var i = 0; i < strings.homeMsgs.length; i++) {
                    var pElement = document.createElement('p');
                    pElement.appendChild(document.createTextNode(strings.homeMsgs[i]));
                    mainContentElement.appendChild(pElement);
                }**/

                /**var logOutButton = document.createElement('a');
                logOutButton.classList.add('log-out-button');
                logOutButton.appendChild(document.createTextNode(strings.logOut));
                logOutButton.href= '#logout';
                logOutButton.onclick = function(e){
                    history.pushState(null, null, logOutButton.href);
                    e.preventDefault();
                    exports.logout();
                };
                mainContentElement.appendChild(logOutButton);**/
                break;
            case LOADING:
                loading.classList.remove('hide');
                signIn.classList.add('hide');
                home.classList.add('hide');
                break;
            case LOGIN:
                window.location.hash = '';
                var loginController = new LoginController();
                loginController.init();
                break;
        }

        /**if(stateClassName !== null) {
            mainContentElement.classList.add(stateClassName);
        }

        if(element) {
            mainContentElement.appendChild(element);
        }**/
        currentState = newState;
    }

    this.logout = function() {
        setUIState(LOGIN);
    };

    this.init = function() {
        var logoutBtn = document.querySelector('.home > .wrapper > button');
        var that = this;
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            that.logout();
        }, false);

        setUIState(HOME);
    };
}