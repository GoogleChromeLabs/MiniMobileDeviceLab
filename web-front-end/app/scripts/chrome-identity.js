/*global define */
define([], function () {
    'use strict';

    var exports = {};

    exports.getUserInfo = function(successCb, errorCb) {
		this.performUserInfoRequest(false, successCb, errorCb);
	}

	exports.performUserInfoRequest = function(isInteractive, successCb, errorCb) {
    	chrome.experimental.identity.getAuthToken({ 'interactive': isInteractive }, function(auth_token) {
    		onGetAuthToken.bind(this)(auth_token, successCb, errorCb);
    	});
	}

	exports.isLoggedIn = function() {
		return false;
	}

	exports.getSignInButton = function() {
		var signInButton = document.createElement('a');
        signInButton.classList.add('sign-in-button');
        signInButton.appendChild(document.createTextNode(strings.sign_in));
        signInButton.href= "#signin";
        signInButton.onclick = function(e){
            if(history.pushState) {
                history.pushState(null, null, signInButton.href);
            }
            e.preventDefault();
            exports.login();
        }

        return signInButton;
	}

	function onGetAuthToken(auth_token, successCb, errorCb) {
    	if (!auth_token) {
      		errorCb();
      		return;
    	}

      
	    // Use the auth token to do an XHR to get the user information.
	    var xhr = new XMLHttpRequest();
	    xhr.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json');
	    xhr.setRequestHeader('Authorization', 'Bearer ' + auth_token);
	    
	    var that = this;
	    xhr.onload = function(e) {
	      if (this.status != 200) {
	        errorCb();
	        return;
	      }

	      onUserInfoFetched(this.response, successCb, errorCb);
	    };
	    xhr.send();
	}

	function onUserInfoFetched(response, successCb, errorCb) {
    	console.log('onUserInfoFetched() response = '+response);

    	var userInfo = JSON.parse(response);
    	populateUserInfo({userId: userInfo.id}, successCb, errorCb);
	}

	function populateUserInfo(userData, successCb, errorCb) {
    	console.log('populateUserInfo cb.onLoggedIn()');
    	successCb(userData);
	}

    return exports;
});