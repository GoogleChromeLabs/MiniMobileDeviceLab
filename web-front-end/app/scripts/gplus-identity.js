/*global define */
define([], function () {
    'use strict';

    var exports = {};

    var clientId = "148156526883-75soacsqseft7npagv6226t9pg0vtbel.apps.googleusercontent.com";
    var callback;

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

	exports.addSignInButton = function(element, successCb, errorCb) {
		var signInButton = document.createElement('span');
		signInButton.id = 'signinButton';

		element.appendChild(signInButton);

		gapi.signin.render(
 			'signinButton',
 			{
 				clientid: clientId,
 				cookiepolicy: "single_host_origin",
 				scope: "https://www.googleapis.com/auth/plus.login",
 				width: "wide",
 				callback: getLoginCallback(successCb, errorCb)
 			}
		);
	}

	function getLoginCallback(successCb, errorCb) {
		return function(authResult) {
			ongplusLogin(authResult, successCb, errorCb);
		}
	}

	function ongplusLogin(authResult, successCb, errorCb) {
		console.log('mock-identity: internalCallback');
		if (authResult['access_token']) {
    		// Successfully authorized
    		successCb(authResult.id_token);
    		//document.getElementById('signinButton').setAttribute('style', 'display: none');
  		} else if (authResult['error']) {
    		// There was an error.
    		// Possible error codes:
    		//   "access_denied" - User denied access to your app
    		//   "immediate_failed" - Could not automatically log in the user
    		errorCb(authResult['error']);
  		}
	}

	function populateUserInfo(userData, successCb, errorCb) {
    	console.log('MockIdentity - populateUserInfo cb.onLoggedIn()');
    	successCb(userData);
	}

    return exports;
});