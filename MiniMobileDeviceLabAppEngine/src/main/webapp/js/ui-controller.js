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
 * Provides methods for UI controls
 *
 */

/** google global namespace for Google projects. */
var google = google || {};

/** devrel namespace for Google Developer Relations projects. */
google.devrel = google.devrel || {};

/** namespace for DevRel mobiledevicelab code. */
google.devrel.mobiledevicelab = google.devrel.mobiledevicelab || {};

/**
 * Show the devices
 * 
 */
google.devrel.mobiledevicelab.showDevices = function() {
	document.getElementById('androidDevicesTable').innerHTML = '';
	if (google.devrel.mobiledevicelab.androidDevices) {
		var table = document.createElement('table');
		table.className = "device";
		var tableBody = document.createElement('tbody');
		var deviceRowTemplate = document.querySelector('#device-row-template').innerHTML;
		var deviceRowBrowserTemplate = document
				.querySelector('#device-row-browser-template').innerHTML;
		var deviceRowBrowserHtml = "";
		var browsers = google.devrel.mobiledevicelab.getBrowsers();
		for (var i = 0; i < browsers.length; i++) {
			deviceRowBrowserHtml = deviceRowBrowserHtml
					+ deviceRowBrowserTemplate.replace(
							"{{browser-index-start-at-1}}", "" + (i + 1));
			deviceRowBrowserHtml = deviceRowBrowserHtml.replace("{{src}}",
					"src=" + browsers[i].icon);
			deviceRowBrowserHtml = deviceRowBrowserHtml.replace("{{alt}}",
					"alt=" + browsers[i].name + " icon");
		}

		var rows = "";
		for (var i = 0; i < google.devrel.mobiledevicelab.androidDevices.length; i++) {
			var device = google.devrel.mobiledevicelab.androidDevices[i];
			rows = rows
					+ google.devrel.mobiledevicelab.createTableRow(device,
							deviceRowTemplate, deviceRowBrowserHtml, true);
		}
		tableBody.innerHTML = rows;
		table.appendChild(tableBody);
		document.getElementById('androidDevicesTable').appendChild(table);
		for (var i = 0; i < google.devrel.mobiledevicelab.androidDevices.length; i++) {
			var device = google.devrel.mobiledevicelab.androidDevices[i];
			google.devrel.mobiledevicelab.finaliseTableRow(device, true);
		}
	}

	document.getElementById('nonAndroidDevicesTable').innerHTML = '';
	if (google.devrel.mobiledevicelab.nonAndroidDevices) {
		var table = document.createElement('table');
		table.className = "device";
		var tableBody = document.createElement('tbody');
		var deviceRowTemplate = document.querySelector('#device-row-template').innerHTML;
		var deviceRowBrowserTemplate = document
				.querySelector('#device-row-browser-template').innerHTML;
		var deviceRowBrowserHtml = "";

		var rows = "";
		for (var i = 0; i < google.devrel.mobiledevicelab.nonAndroidDevices.length; i++) {
			var device = google.devrel.mobiledevicelab.nonAndroidDevices[i];
			rows = rows
					+ google.devrel.mobiledevicelab.createTableRow(device,
							deviceRowTemplate, deviceRowBrowserHtml, false);

		}
		tableBody.innerHTML = rows;
		table.appendChild(tableBody);
		document.getElementById('nonAndroidDevicesTable').appendChild(table);
		for (var i = 0; i < google.devrel.mobiledevicelab.nonAndroidDevices.length; i++) {
			var device = google.devrel.mobiledevicelab.nonAndroidDevices[i];
			google.devrel.mobiledevicelab.finaliseTableRow(device, false);
		}
	}
}

/**
 * Creates the initial html for the table row
 * 
 * @param device
 *            The device
 * @param deviceRowTemplate
 *            The raw Html for the table row
 * @param deviceRowBrowserHtml
 *            The html for the browser section
 * @param android
 *            Pass in true for Android devices, false for others
 */
google.devrel.mobiledevicelab.createTableRow = function(device,
		deviceRowTemplate, deviceRowBrowserHtml, android) {
	if (android) {
		var newRow = deviceRowTemplate.replace("{{browser-row}}",
				deviceRowBrowserHtml);
		newRow = newRow.split("{{id}}").join("" + device.id);
		newRow = newRow.replace("{{device-name}}", "" + device.deviceName);
		newRow = newRow.replace("{{device-version}}", ""
				+ device.platformVersion);
		return newRow;
	} else {
		var newRow = deviceRowTemplate.split("{{id}}").join("" + device.id);
		newRow = newRow.replace("{{device-name}}", "" + device.deviceName);
		newRow = newRow.replace("{{device-version}}", "");
		newRow = newRow.replace("{{browser-row}}", "");
		return newRow;
	}
}

/**
 * Finalise the UI for the table row
 * 
 * @param device
 *            The device
 * @param android
 *            Pass in true for Android devices, false for others
 */
google.devrel.mobiledevicelab.finaliseTableRow = function(device, android) {
	google.devrel.mobiledevicelab.enableDeviceButtons(device.id,
			device.deviceName, android);
	if (!google.devrel.mobiledevicelab.devicesState.hasOwnProperty(device.id)) {
		google.devrel.mobiledevicelab.devicesState[device.id] = {
			browser : 0,
			on : true,
			name : device.deviceName
		};
	}
	
	google.devrel.mobiledevicelab.devicesState[device.id].name = device.deviceName;
	if (android){
		google.devrel.mobiledevicelab.selectBrowser(device.id,
				google.devrel.mobiledevicelab.devicesState[device.id].browser);
	}
	if (!google.devrel.mobiledevicelab.devicesState[device.id].on) {
		google.devrel.mobiledevicelab.showDeviceEnabled(device.id,
				google.devrel.mobiledevicelab.devicesState[device.id].on);
	}
	document.querySelector('#toggle-' + device.id).checked = google.devrel.mobiledevicelab.devicesState[device.id].on;
}

/**
 * Enables the button callbacks in the UI.
 */
google.devrel.mobiledevicelab.enableButtons = function() {
	document.getElementById('pushUrl').onclick = function() {
		google.devrel.mobiledevicelab
				.pushUrl(document.getElementById('url').value);
	}

	document.getElementById('signinButton').onclick = function() {
		google.devrel.mobiledevicelab.signin();
	}

	document.getElementById('getDevices1').onclick = function() {
		google.devrel.mobiledevicelab.getDevices();
	}

	document.getElementById('getDevices2').onclick = function() {
		google.devrel.mobiledevicelab.getDevices();
	}

	document.getElementById('android-header-checkbox').onclick = function() {
		google.devrel.mobiledevicelab.devicesToggled(true);
	}

	document.getElementById('non-android-header-checkbox').onclick = function() {
		google.devrel.mobiledevicelab.devicesToggled(false);
	}
};

/**
 * Enable the controls for each device row
 * 
 * @param deviceId
 * @param name
 *            Device name
 * @param android
 *            Whether device is Android device
 */
google.devrel.mobiledevicelab.enableDeviceButtons = function(deviceId, name,
		android) {
	if (android) {
		var browserImages = google.devrel.mobiledevicelab
				.getDeviceBrowsersElementsDOM(deviceId);
		browserImages[0].onclick = function() {
			google.devrel.mobiledevicelab.selectBrowser(deviceId, 0);
		}
		browserImages[1].onclick = function() {
			google.devrel.mobiledevicelab.selectBrowser(deviceId, 1);
		}
		browserImages[2].onclick = function() {
			google.devrel.mobiledevicelab.selectBrowser(deviceId, 2);
		}
		browserImages[3].onclick = function() {
			google.devrel.mobiledevicelab.selectBrowser(deviceId, 3);
		}
		browserImages[4].onclick = function() {
			google.devrel.mobiledevicelab.selectBrowser(deviceId, 4);
		}
		browserImages[5].onclick = function() {
			google.devrel.mobiledevicelab.selectBrowser(deviceId, 5);
		}
		browserImages[6].onclick = function() {
			google.devrel.mobiledevicelab.selectBrowser(deviceId, 6);
		}
		browserImages[7].onclick = function() {
			google.devrel.mobiledevicelab.selectBrowser(deviceId, 7);
		}

	}

	var enabledCheckbox = document.querySelector('#toggle-' + deviceId);
	enabledCheckbox.addEventListener('change', google.devrel.mobiledevicelab
			.getEnableDeviceCallback(deviceId), true);

	document.getElementById('delete-' + deviceId).onclick = function() {
		google.devrel.mobiledevicelab.deleteDevice(deviceId, name);
	}

	document.getElementById('edit-' + deviceId).onclick = function() {
		google.devrel.mobiledevicelab.showEditDeviceNameMode(deviceId);
	}
	document.getElementById('device-name-input-confirm-' + deviceId).onclick = function() {
		google.devrel.mobiledevicelab.editDevice(deviceId);
	}
};

/**
 * A callback to handle completion of device toggling
 */
google.devrel.mobiledevicelab.getEnableDeviceCallback = function(deviceId) {
	return function(e) {
		google.devrel.mobiledevicelab.showDeviceEnabled(deviceId,
				e.target.checked);
	}.bind(this);
};

/**
 * Callback when android toggle on/off is changed
 * 
 * @param android
 *            Pass in true for android devices, false for other devices
 */
google.devrel.mobiledevicelab.devicesToggled = function(android) {
	if (android) {
		google.devrel.mobiledevicelab.androidDevicesSwitchedOff = !document
				.querySelector('#android-header-checkbox').checked;
	} else {
		google.devrel.mobiledevicelab.nonAndroidDevicesSwitchedOff = !document
				.querySelector('#non-android-header-checkbox').checked;
	}
	var fadeDuration = 300;
	var fadeOut = 0.1;
	if (android) {
		if (google.devrel.mobiledevicelab.androidDevicesSwitchedOff) {
			$('#androidDevicesTable').fadeTo(fadeDuration, fadeOut);
		} else {
			$('#androidDevicesTable').fadeTo(fadeDuration, 1.0);
		}
	} else {
		if (google.devrel.mobiledevicelab.nonAndroidDevicesSwitchedOff) {
			$('#nonAndroidDevicesTable').fadeTo(fadeDuration, fadeOut);
		} else {
			$('#nonAndroidDevicesTable').fadeTo(fadeDuration, 1.0);
		}
	}
}

/**
 * 
 * Amend the device row to show it enabled/disabled
 * 
 * @param deviceId
 * @param enabled
 */
google.devrel.mobiledevicelab.showDeviceEnabled = function(deviceId, enabled) {
	var fadeDuration = 300;
	var fadeOut = 0.1;
	if (enabled) {
		google.devrel.mobiledevicelab.devicesState[deviceId].on = true;
		$('#device-name-' + deviceId).fadeTo(fadeDuration, 1.0);
		$('#device-version-' + deviceId).fadeTo(fadeDuration, 1.0);
		google.devrel.mobiledevicelab.selectBrowser(deviceId,
				google.devrel.mobiledevicelab.devicesState[deviceId].browser);
		$('#delete-' + deviceId).fadeTo(fadeDuration, 1.0);
		$('#edit-' + deviceId).fadeTo(fadeDuration, 1.0);
	} else {
		google.devrel.mobiledevicelab.devicesState[deviceId].on = false;
		$('#device-name-' + deviceId).fadeTo(fadeDuration, fadeOut);
		$('#device-version-' + deviceId).fadeTo(fadeDuration, fadeOut);
		var browserImages = google.devrel.mobiledevicelab
				.getDeviceBrowsersElementsJQuery(deviceId);
		for (var i = 0; i < 8; i++) {
			browserImages[i].fadeTo(fadeDuration, fadeOut);
		}
		$('#delete-' + deviceId).fadeTo(fadeDuration, fadeOut);
		$('#edit-' + deviceId).fadeTo(fadeDuration, fadeOut);
	}
};

/**
 * 
 * Show an edit field for the device name
 * 
 * @param deviceId
 */
google.devrel.mobiledevicelab.showEditDeviceNameMode = function(deviceId) {
	if (!google.devrel.mobiledevicelab.devicesState[deviceId].on) {
		document.getElementById('devicesMessage').innerHTML = 'Cannot edit a deselected device';
		return;
	}
	document.getElementById('device-name-display-' + deviceId).style.display = 'none';
	document.getElementById('device-name-input-' + deviceId).style.display = 'inline';
	document.getElementById('device-name-input-confirm-' + deviceId).style.display = 'inline';
	document.getElementById('device-name-input-' + deviceId).value = google.devrel.mobiledevicelab.devicesState[deviceId].name;
};

/**
 * A callback to handle browser selection
 */
google.devrel.mobiledevicelab.selectBrowser = function(deviceId, index) {
	if (!google.devrel.mobiledevicelab.devicesState[deviceId].on) {
		document.getElementById('devicesMessage').innerHTML = 'Cannot select a browser for a deselected device';
		return;
	}
	google.devrel.mobiledevicelab.devicesState[deviceId].browser = index;

	var fadeDuration = 300;
	var fadeOut = 0.25;
	var browserImages = google.devrel.mobiledevicelab
			.getDeviceBrowsersElementsJQuery(deviceId);
	for (var i = 0; i < 8; i++) {
		if (i == index) {
			browserImages[i].fadeTo(fadeDuration, 1.0);
		} else {
			browserImages[i].fadeTo(fadeDuration, fadeOut);
		}
	}
};

/**
 * Shows the urls suggestions
 */
google.devrel.mobiledevicelab.showUrlsSuggestions = function() {
	if (google.devrel.mobiledevicelab.urls) {
		var datalistRowTemplate = document.querySelector('#datalist-row-template').innerHTML;
		var datalistRows = "";
		for (var i = 0; i < google.devrel.mobiledevicelab.urls.length; i++){
			datalistRows = datalistRows + datalistRowTemplate.replace("{{value}}",google.devrel.mobiledevicelab.urls[i].url);
		}
		document.getElementById('previousUrls').innerHTML = datalistRows;
		document.getElementById('url').list = 'previousUrls';
	}
	
};