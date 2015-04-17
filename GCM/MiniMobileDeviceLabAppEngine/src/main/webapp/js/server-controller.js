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
 * Provides methods for communicating with server
 *
 */

/** google global namespace for Google projects. */
var google = google || {};

/** devrel namespace for Google Developer Relations projects. */
google.devrel = google.devrel || {};

/** namespace for DevRel mobiledevicelab code. */
google.devrel.mobiledevicelab = google.devrel.mobiledevicelab || {};

/**
 * Get the list of devices for the signed in user then calls showDevices
 */
google.devrel.mobiledevicelab.getDevices = function() {
	if (google.devrel.mobiledevicelab.signedIn) {
		google.devrel.mobiledevicelab
				.displayDeviceMessage('Refreshing your devices...');
		gapi.client.devicelab
				.getDevices({
					'accessToken' : google.devrel.mobiledevicelab.token,
					'userId' : google.devrel.mobiledevicelab.userId
				})
				.then(
						function(resp) {
							google.devrel.mobiledevicelab
									.displayDeviceMessage('');
							google.devrel.mobiledevicelab.androidDevices = [];
							google.devrel.mobiledevicelab.nonAndroidDevices = [];
							for (var i = 0; i < resp.result.items.length; i++) {
								if (resp.result.items[i].platformId == 0) {
									google.devrel.mobiledevicelab.androidDevices
											.push(resp.result.items[i]);
								} else {
									google.devrel.mobiledevicelab.nonAndroidDevices
											.push(resp.result.items[i]);
								}
							}
							google.devrel.mobiledevicelab.showDevices();
							if (!google.devrel.mobiledevicelab.androidDevices
									&& !google.devrel.mobiledevicelab.nonAndroidDevices) {
								google.devrel.mobiledevicelab
										.displayDeviceMessage('You have no devices. Refer to <a href="https://github.com/GoogleChrome/MiniMobileDeviceLab/tree/v2">https://github.com/GoogleChrome/MiniMobileDeviceLab/tree/v2</a> for details on how to add a device.');
							}
						},
						function(reason) {
							if (reason.status == 401){
								google.devrel.mobiledevicelab
								.displayDeviceMessage('Your sign-in token has expired, please refresh the page.');
							} else {
								google.devrel.mobiledevicelab
								.displayDeviceMessage('Error getting devices.');
							}
						});

	}
}

/**
 * Edit the device name
 * 
 * @param id
 *            The id of the device
 */
google.devrel.mobiledevicelab.editDevice = function(id) {
	document.getElementById('device-name-display-' + id).style.display = 'inline';
	document.getElementById('device-name-input-' + id).style.display = 'none';
	document.getElementById('device-name-input-confirm-' + id).style.display = 'none';

	var name = document.getElementById('device-name-input-' + id).value;
	if (name != google.devrel.mobiledevicelab.devicesState[id].name) {
		google.devrel.mobiledevicelab
				.displayDeviceMessage('Saving new device name ' + name);
		gapi.client.devicelab.editDevice({
			'deviceId' : id,
			'token' : google.devrel.mobiledevicelab.token,
			'userId' : google.devrel.mobiledevicelab.userId,
			'deviceName' : name
		}).then(
				function(resp) {
					google.devrel.mobiledevicelab
							.displayDeviceMessage('Success!');
					google.devrel.mobiledevicelab.getDevices();
				},
				function(reason) {
					google.devrel.mobiledevicelab
							.displayDeviceMessage('Error updating name. '
									+ reason.result.error.message);
				});
	} else {
		google.devrel.mobiledevicelab
				.displayDeviceMessage('Device name unchanged');
	}
};

/**
 * Delete the device
 * 
 * @param id
 *            The id of the device
 * @param name
 *            The device name
 */
google.devrel.mobiledevicelab.deleteDevice = function(id, name) {
	if (!google.devrel.mobiledevicelab.devicesState[id].on) {
		google.devrel.mobiledevicelab
				.displayDeviceMessage('Cannot delete a deselected device');
		return;
	}
	google.devrel.mobiledevicelab.displayDeviceMessage('Deleting device '
			+ name + ' ...');
	gapi.client.devicelab.deleteDevice({
		'deviceId' : id,
		'accessToken' : google.devrel.mobiledevicelab.token,
		'userId' : google.devrel.mobiledevicelab.userId
	}).then(
			function(resp) {
				google.devrel.mobiledevicelab.displayDeviceMessage('Success!');
				google.devrel.mobiledevicelab.getDevices();
			},
			function(reason) {
				google.devrel.mobiledevicelab
						.displayDeviceMessage('Error deleting device. '
								+ reason.result.error.message);
			});
};

/**
 * This displays the same message next to each device section header
 * (android/non-android)
 * 
 * @param message
 */
google.devrel.mobiledevicelab.displayDeviceMessage = function(message) {
	document.getElementById('devicesMessage1').innerHTML = message;
	document.getElementById('devicesMessage2').innerHTML = message;
};

/**
 * Pushes a url to Android devices
 * 
 * @param {string}
 *            url to push
 */
google.devrel.mobiledevicelab.pushUrl = function(url) {
	if (google.devrel.mobiledevicelab.androidDevicesSwitchedOff
			&& google.devrel.mobiledevicelab.nonAndroidDevicesSwitchedOff) {
		document.getElementById('pushMessage').innerHTML = 'Android devices and non Android devices toggle buttons are off!';
	} else {
		document.getElementById('pushMessage').innerHTML = 'Pushing url to devices...';
		var enabledDevicesAndBrowser = [];
		if (!google.devrel.mobiledevicelab.androidDevicesSwitchedOff) {
			for (var i = 0; i < google.devrel.mobiledevicelab.androidDevices.length; i++) {
				var device = google.devrel.mobiledevicelab.androidDevices[i];
				if (document.querySelector('#toggle-' + device.id).checked) {
					enabledDevicesAndBrowser
							.push({
								"deviceId" : device.id,
								"browserPackageName" : google.devrel.mobiledevicelab
										.getBrowsers()[google.devrel.mobiledevicelab.devicesState[device.id].browser].pkg
							});
				}
			}
		}
		if (!google.devrel.mobiledevicelab.nonAndroidDevicesSwitchedOff) {
			for (var i = 0; i < google.devrel.mobiledevicelab.nonAndroidDevices.length; i++) {
				var device = google.devrel.mobiledevicelab.nonAndroidDevices[i];
				if (document.querySelector('#toggle-' + device.id).checked) {
					enabledDevicesAndBrowser.push({
						"deviceId" : device.id
					});
				}
			}
		}

		gapi.client.devicelab
				.pushUrl({
					'url' : url,
					'token' : google.devrel.mobiledevicelab.token,
					'userId' : google.devrel.mobiledevicelab.userId,
					'browserPackageName' : "com.android.chrome",
					'sameBrowserForAllDevices' : false,
					'individualDevices' : enabledDevicesAndBrowser
				})
				.then(
						function(resp) {
							if (resp.result.success) {
								document.getElementById('pushMessage').innerHTML = 'Success! '
										+ resp.result.message;
							} else {
								document.getElementById('pushMessage').innerHTML = 'Error pushing url. '
										+ resp.result.error;
							}
							google.devrel.mobiledevicelab.getUrls();
						},
						function(reason) {
							document.getElementById('pushMessage').innerHTML = 'Error pushing url. '
									+ reason.result.error.message;
						});

	}
};

/**
 * Get the list of the previously used urls for the signed in user
 */
google.devrel.mobiledevicelab.getUrls = function() {
	if (google.devrel.mobiledevicelab.signedIn) {
		gapi.client.devicelab.getUrls({
			'accessToken' : google.devrel.mobiledevicelab.token,
			'userId' : google.devrel.mobiledevicelab.userId
		}).then(function(resp) {
			google.devrel.mobiledevicelab.urls = resp.result.items;
			google.devrel.mobiledevicelab.showUrlsSuggestions();
		}, function(reason) {
			// Fail silently
		});

	}
}

/**
 * Registers the browser with the server, to get automatic updates
 * 
 */
google.devrel.mobiledevicelab.registerBrowserForUpdates = function() {
	var d = new Date();
	var clientId = 'user' + google.devrel.mobiledevicelab.userId + 'time' + d.getMilliseconds();

	gapi.client.devicelab
			.registerBrowserForUpdates({
				'accessToken' : google.devrel.mobiledevicelab.token,
				'userId' : google.devrel.mobiledevicelab.userId,
				'clientId' : clientId
			})
			.then(
					function(resp) {
						google.devrel.mobiledevicelab.labchannel = new goog.appengine.Channel(
								resp.result.message);
						google.devrel.mobiledevicelab.labsocket = google.devrel.mobiledevicelab.labchannel
								.open();
						google.devrel.mobiledevicelab.labsocket.onopen = google.devrel.mobiledevicelab.onLabSocketOpened;
						google.devrel.mobiledevicelab.labsocket.onmessage = google.devrel.mobiledevicelab.onLabSocketMessage;
						google.devrel.mobiledevicelab.labsocket.onerror = google.devrel.mobiledevicelab.onLabSocketError;
						google.devrel.mobiledevicelab.labsocket.onclose = google.devrel.mobiledevicelab.onLabSocketClose;

					},
					function(reason) {
						//Fail silently
					});
}

/**
 * Callback for when socket is opened
 */
google.devrel.mobiledevicelab.onLabSocketOpened = function() {
	console.log("Lab socket opened");
}

/**
 * Callback for when socket receives a message
 */
google.devrel.mobiledevicelab.onLabSocketMessage = function(message) {
	console.log("Lab socket message");
	console.log(message);
	if (message.data === "disconnect") {
		google.devrel.mobiledevicelab.disconnect();
		google.devrel.mobiledevicelab.registerBrowserForUpdates();
	} else {
		google.devrel.mobiledevicelab.getDevices();
	}
}

/**
 * Callback for when socket is in an error state
 */
google.devrel.mobiledevicelab.onLabSocketError = function() {
	console.log("Lab socket error");
	google.devrel.mobiledevicelab.registerBrowserForUpdates();
}

/**
 * Callback for when socket is closed
 */
google.devrel.mobiledevicelab.onLabSocketClose = function() {
	console.log("Lab socket close");
}

/**
 * Disconnects the registered device
 */
google.devrel.mobiledevicelab.disconnect = function() {
	console.log("Lab socket disconnect");
	google.devrel.mobiledevicelab.labsocket.close();
	google.devrel.mobiledevicelab.labsocket = null;
	google.devrel.mobiledevicelab.labchannel = null;
}
