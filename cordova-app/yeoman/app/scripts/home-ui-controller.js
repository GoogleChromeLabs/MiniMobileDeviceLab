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