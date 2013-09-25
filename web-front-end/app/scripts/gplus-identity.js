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
define(['strings'], function (strings) {
    'use strict';

    var exports = {};

    var clientId = "148156526883-75soacsqseft7npagv6226t9pg0vtbel.apps.googleusercontent.com";
    var callback;
    var autoSignIn = true;

    exports.getUserInfo = function(successCb, errorCb) {
		this.performUserInfoRequest(false, successCb, errorCb);
	}


	exports.performUserInfoRequest = function(isInteractive, successCb, errorCb) {
	    console.log('MockIdentity.prototype.performUserInfoRequest ');
		populateUserInfo({userId: -1}, successCb, errorCb);
	}

	exports.isLoggedIn = function() {
		return false;
	}

	exports.addSignInButton = function(element, successCb, errorCb, requiresLoginCb) {
		var signInSpan = document.createElement('span');
		signInSpan.appendChild(document.createTextNode(strings.sign_in));

		var gplusLogo = document.createElement('img');
		gplusLogo.src = './images/g-plus-logo.png';

		var signInButton = document.createElement('span');
        signInButton.classList.add('sign-in-button');
        signInButton.appendChild(gplusLogo);
        signInButton.appendChild(signInSpan);
        signInButton.href= "#signin";

        element.appendChild(signInButton);

        gapi.signin.render(
 			signInButton,
 			{
 				clientid: clientId,
 				cookiepolicy: "single_host_origin",
 				scope: "https://www.googleapis.com/auth/plus.login",
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
		if (authResult['access_token']) {
    		// Successfully authorized
    		successCb(authResult.id_token, autoSignIn);
  		} else if (authResult['error'] === 'immediate_failed') {
  			autoSignIn = false;
  			requiresLoginCb();
  		} else if (authResult['error']) {
    		// There was an error.
    		// Possible error codes:
    		//   "access_denied" - User denied access to your app
    		autoSignIn = false;
    		errorCb(authResult['error']);
  		}
	}

	function populateUserInfo(userData, successCb, errorCb) {
    	successCb(userData);
	}

    return exports;
});