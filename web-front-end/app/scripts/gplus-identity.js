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
function GPlusIdentity() {
  var clientId = '148156526883-75soacsqseft7npagv6226t9pg0vtbel.apps.googleusercontent.com';
  var autoSignIn = true;

  this.isLoggedIn = function() {
    return false;
  };

  this.initSignInButton = function(signInButton, autoSignIn,
    successCb, errorCb, requiresLoginCb, loadingCb) {
    if(!autoSignIn) {
      requiresLoginCb();
      signInButton.addEventListener('click', function(e) {
        loadingCb();
        startSignIn(e.target, successCb, errorCb, requiresLoginCb);
      }, true);
    } else {
      loadingCb();
      startSignIn(signInButton, successCb, errorCb, requiresLoginCb);
    }
  };

  this.silentSignIn = function(callback) {
    window.gapi.auth.signIn(
      {
        clientid: clientId,
        cookiepolicy: 'single_host_origin',
        scope: 'https://www.googleapis.com/auth/plus.login',
        callback: function(authResult) {
          console.log('silentSignIn Callback', authResult);
          if (authResult.access_token) {
            // Successfully authorized
            callback(null, authResult.id_token);
          } else if (authResult.error) {
            // There was an error.
            // Possible error codes:
            //   "access_denied" - User denied access to your app
            callback(authResult.error);
          } else {
            callback('Unknown error occured');
          }
        }
      }
    );
  };

  function startSignIn(signInButton, successCb, errorCb, requiresLoginCb) {
    window.gapi.signin.render(
      signInButton,
      {
        clientid: clientId,
        cookiepolicy: 'single_host_origin',
        scope: 'https://www.googleapis.com/auth/plus.login',
        callback: getLoginCallback(successCb, errorCb, requiresLoginCb)
      }
    );
  }

  function getLoginCallback(successCb, errorCb, requiresLoginCb) {
    return function(authResult) {
      ongplusLogin(authResult, successCb, errorCb, requiresLoginCb);
    };
  }

  function ongplusLogin(authResult, successCb, errorCb, requiresLoginCb) {
    /*jshint camelcase: false */
    if (authResult.access_token) {
      // Successfully authorized
      successCb(authResult.id_token, autoSignIn);
    } else if (authResult.error === 'immediate_failed') {
      autoSignIn = false;
      requiresLoginCb();
    } else if (authResult.error) {
      // There was an error.
      // Possible error codes:
      //   "access_denied" - User denied access to your app
      autoSignIn = false;
      errorCb(authResult.error);
    }
  }

  function populateUserInfo(userData, successCb) {
    successCb(userData);
  }
}
