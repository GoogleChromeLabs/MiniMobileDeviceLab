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
  var gplusIdentity = new GPlusIdentity();

  var LOADING = 0;
  var SIGN_IN = 1;
  var HOME = 2;

  var currentState;
  var identityController;
  var idToken;

  function setUIState(newState) {
    console.log('login-ui-controller: setUIState = '+newState);
    if(currentState === newState) {
      return;
    }

    var signIn = document.querySelector('.sign-in');
    var loading = document.querySelector('.loading');

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

      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

      loading.classList.remove('hide');
      signIn.classList.add('hide');

      document.cookie = 'token=' + idToken + '; path=/';
      window.location.href = 'home.html';
      break;
    }

    currentState = newState;
  }

  this.init = function() {
    identityController = gplusIdentity;

    var autoSignIn = true;
    var cookie = this.getFriendlyCookie();
    if(typeof cookie.autosignin !== 'undefined') {
      autoSignIn = cookie.autosignin === 'false' ? false : autoSignIn;
    }

    var signInBtn = document.querySelector('.sign-in > .wrapper > button');
    identityController.initSignInButton(signInBtn, autoSignIn, function(token) {
      idToken = token;
      // Success - Signed In
      setUIState(HOME);
    }, function(errorMsg) {
      /* jshint unused: false */

      // Error
      setUIState(SIGN_IN);
    }, function() {
      // Requires Interactive Login
      setUIState(SIGN_IN);
    }, function() {
      // Starting Sign In
      setUIState(LOADING);
    });
  };

  this.getFriendlyCookie = function() {
    var keyValueStrings = document.cookie.split(';');
    var friendlyCookie = {};
    for(var i=0; i < keyValueStrings.length; i++)  {
      var attribute = keyValueStrings[i].trim().split('=');
      if(attribute.length !== 2) {
        continue;
      }

      friendlyCookie[attribute[0]] = attribute[1];
    }

    return friendlyCookie;
  };
}
