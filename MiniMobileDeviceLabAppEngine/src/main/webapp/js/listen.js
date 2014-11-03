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
 * Provides methods for listen.html page
 *
 */

/** google global namespace for Google projects. */
var google = google || {};

/** devrel namespace for Google Developer Relations projects. */
google.devrel = google.devrel || {};

/** namespace for DevRel mobiledevicelab code. */
google.devrel.mobiledevicelab = google.devrel.mobiledevicelab || {};

/**
 * Enables the button callbacks in the UI.
 */
google.devrel.mobiledevicelab.enableButtons = function() {
	document.getElementById('signinButton').onclick = function() {
		google.devrel.mobiledevicelab.signin();
	}

	document.getElementById('registerDevice').onclick = function() {
		google.devrel.mobiledevicelab.registerDevice(document
				.getElementById('deviceName').value);
	}
};

/**
 * Unused but called in shared code in base.js
 */
google.devrel.mobiledevicelab.getDevices = function() {
	// unused
}

/**
 * Unused but called in shared code in base.js
 */
google.devrel.mobiledevicelab.getUrls = function() {
	// unused
}

/**
 * Unused but called in shared code in base.js
 */
google.devrel.mobiledevicelab.registerBrowserForUpdates = function() {
	// unused
}


/**
 * Registers the device with the server
 * 
 * @param deviceName
 */
google.devrel.mobiledevicelab.registerDevice = function(deviceName) {
	var d = new Date();
	var clientId = google.devrel.mobiledevicelab.token
			+ deviceName.split(" ").join("") + d.getMilliseconds();

	document.getElementById('registeredDeviceMessage').innerHTML = 'Registering your device/browser with the server...';

	gapi.client.devicelab
			.saveDevice({
				'token' : google.devrel.mobiledevicelab.token,
				'userId' : google.devrel.mobiledevicelab.userId,
				'deviceName' : deviceName,
				'browserClientId' : clientId,
				'platformId' : 1
			})
			.then(
					function(resp) {
						google.devrel.mobiledevicelab.registeredDevice = resp.result;

						google.devrel.mobiledevicelab.channel = new goog.appengine.Channel(
								google.devrel.mobiledevicelab.registeredDevice.browserToken);
						google.devrel.mobiledevicelab.socket = google.devrel.mobiledevicelab.channel
								.open();
						google.devrel.mobiledevicelab.socket.onopen = google.devrel.mobiledevicelab.onSocketOpened;
						google.devrel.mobiledevicelab.socket.onmessage = google.devrel.mobiledevicelab.onSocketMessage;
						google.devrel.mobiledevicelab.socket.onerror = google.devrel.mobiledevicelab.onSocketError;
						google.devrel.mobiledevicelab.socket.onclose = google.devrel.mobiledevicelab.onSocketClose;

					},
					function(reason) {
						document.getElementById('registeredDeviceMessage').innerHTML = 'Error registering the device/browser. '
								+ reason.result.error.message;
					});
}

/**
 * Callback for when socket is opened
 */
google.devrel.mobiledevicelab.onSocketOpened = function() {
	document.getElementById('registeredDeviceMessage').innerHTML = 'Success! Stay on this page to receive urls.';
}

/**
 * Callback for when socket receives a message
 */
google.devrel.mobiledevicelab.onSocketMessage = function(message) {
	console.log("Socket message");
	console.log(message);
	if (message.data === "disconnect") {
		google.devrel.mobiledevicelab.disconnect();
	} else if (message.data.indexOf("name") > -1) {
		document.getElementById('deviceName').value = message.data.replace(
				"name:", "");
	} else {
		window.open(message.data, '_blank');
	}
}

/**
 * Callback for when socket is in an error state
 */
google.devrel.mobiledevicelab.onSocketError = function() {
	console.log("Error");
	google.devrel.mobiledevicelab.disconnect();
}

/**
 * Callback for when socket is closed
 */
google.devrel.mobiledevicelab.onSocketClose = function() {
	console.log("Close");
}

/**
 * Disconnects the registered device
 */
google.devrel.mobiledevicelab.disconnect = function() {
	google.devrel.mobiledevicelab.signout();
	document.getElementById('registeredDeviceMessage').innerHTML = 'Your previous session has timed out, click on send button to register the device again';
	google.devrel.mobiledevicelab.registeredDevice = null;
	google.devrel.mobiledevicelab.socket.close();
	google.devrel.mobiledevicelab.socket = null;
	google.devrel.mobiledevicelab.channel = null;
}
