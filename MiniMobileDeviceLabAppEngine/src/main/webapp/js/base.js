/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 **/
/**
 * @fileoverview
 * Provides init() and signed in methods
 *
 */

/** google global namespace for Google projects. */
var google = google || {};

/** devrel namespace for Google Developer Relations projects. */
google.devrel = google.devrel || {};

/** namespace for DevRel mobiledevicelab code. */
google.devrel.mobiledevicelab = google.devrel.mobiledevicelab || {};

/**
 * Whether or not the user is signed in.
 * 
 * @type {boolean}
 */
google.devrel.mobiledevicelab.signedIn = false;

/**
 * Center some elements on the screen
 * 
 */
jQuery(document).ready(function($) {
	$(window).resize(function() {
		$('.loggedOut').css({
			position : 'absolute',
			left : ($(window).width() - $('.loggedOut').outerWidth()) / 2,
			top : ($(window).height() - $('.loggedOut').outerHeight()) / 2
		});
	});
	$(window).resize();
});

/**
 * Handles the login flow
 */
google.devrel.mobiledevicelab.signin = function() {
	var additionalParams = {
		'callback' : google.devrel.mobiledevicelab.signincallback
	};
	gapi.auth.signIn(additionalParams);
}

/**
 * Signs the user out
 */
google.devrel.mobiledevicelab.signout = function() {
	google.devrel.mobiledevicelab.signedIn = false;
	google.devrel.mobiledevicelab.userId = null;
	document.getElementById('loggedOut').style.display = 'block';
	document.getElementById('loggedIn').style.display = 'none';
	document.getElementById('navbar').style.display = 'none';
}

/**
 * Handles the response from google after trying to sign in
 * 
 * @param authResult
 *            The result from gapi.auth.signIn method
 */
google.devrel.mobiledevicelab.signincallback = function(authResult) {
	if (authResult['status']['signed_in']) {
		google.devrel.mobiledevicelab.token = authResult['access_token'];
		gapi.client.load('oauth2', 'v2', function() {
			gapi.client.oauth2.userinfo.get().execute(function(resp) {
				if (!google.devrel.mobiledevicelab.userId) {
					google.devrel.mobiledevicelab.userId = resp['id'];
					google.devrel.mobiledevicelab.showSignedin();
					google.devrel.mobiledevicelab.getDevices();
					google.devrel.mobiledevicelab.registerBrowserForUpdates();
					google.devrel.mobiledevicelab.getUrls();
				}
			});
		});
	} else {
		google.devrel.mobiledevicelab.signedIn = false;
		console.log(authResult['error']);
	}
}

/**
 * Displays the page as signed in
 * 
 */
google.devrel.mobiledevicelab.showSignedin = function() {
	document.getElementById('loggedOut').style.display = 'none';
	document.getElementById('loggedIn').style.display = 'block';
	document.getElementById('navbar').style.display = 'block';
	google.devrel.mobiledevicelab.signedIn = true;

}

/**
 * Initializes the application.
 * 
 * @param {string}
 *            apiRoot Root of the API's path.
 */
google.devrel.mobiledevicelab.init = function(apiRoot) {
	// Loads the OAuth and helloworld APIs asynchronously, and triggers login
	// when they have completed.
	
	var apisToLoad;
	var callback = function() {
		if (--apisToLoad == 0) {
			google.devrel.mobiledevicelab.enableButtons();
			google.devrel.mobiledevicelab.signin(true,
					google.devrel.mobiledevicelab.userAuthed);
		}
	}
	apisToLoad = 2; // must match number of calls to gapi.client.load()
	google.devrel.mobiledevicelab.signout();
	gapi.client.load('devicelab', 'v1', callback, apiRoot);
	gapi.client.load('oauth2', 'v2', callback);
};
