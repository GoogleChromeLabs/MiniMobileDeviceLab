/**
Copyright 2014 Google Inc. All Rights Reserved.

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

/**
 * A simple model to display the available browsers for the Android platform
 */

/** google global namespace for Google projects. */
var google = google || {};

/** devrel namespace for Google Developer Relations projects. */
google.devrel = google.devrel || {};

/** namespace for DevRel mobiledevicelab code. */
google.devrel.mobiledevicelab = google.devrel.mobiledevicelab || {};

var iconDir = 'images/browser-icons/android/';
var browsers = [
  {
    name: 'Chrome',
    icon: iconDir+'chrome-icon.png',
    pkg: 'com.android.chrome'
  }, {
    name: 'Chrome Beta',
    icon: iconDir+'chrome-beta-icon.png',
    pkg: 'com.chrome.beta'
  },{
    name: 'Firefox',
    icon: iconDir+'firefox-icon.png',
    pkg: 'org.mozilla.firefox'
  },{
    name: 'Firefox Beta',
    icon: iconDir+'firefox-beta-icon.png',
    pkg: 'org.mozilla.firefox_beta'
  },
  {
    name: 'Opera',
    icon: iconDir+'opera-icon.png',
    pkg: 'com.opera.browser'
  },
  {
    name: 'Opera Beta',
    icon: iconDir+'opera-beta-icon.png',
    pkg: 'com.opera.browser.beta'
  },
  {
    name: 'Opera Mini',
    icon: iconDir+'opera-mini-icon.png',
    pkg: 'com.opera.mini.android'
  },
  {
    name: 'Opera Classic',
    icon: iconDir+'opera-classic-icon.png',
    pkg: 'com.opera.browser.classic'
  }
];


/**
 * Helper method to get browsers
 */
google.devrel.mobiledevicelab.getBrowsers = function() {
  return browsers;
};

/**
 * This returns the array of browser images elements for the given deviceId, in jquery form
 * 
 * @param deviceId
 */
google.devrel.mobiledevicelab.getDeviceBrowsersElementsJQuery = function(deviceId){
	var browserImages = [$('#device-browser-1-' + deviceId),$('#device-browser-2-' + deviceId),$('#device-browser-3-' + deviceId),$('#device-browser-4-' + deviceId),
	                     $('#device-browser-5-' + deviceId),$('#device-browser-6-' + deviceId),$('#device-browser-7-' + deviceId),$('#device-browser-8-' + deviceId)];
	return browserImages;
}

/**
 * This returns the array of browser images elements for the given deviceId, in DOM form
 * 
 * @param deviceId
 */
google.devrel.mobiledevicelab.getDeviceBrowsersElementsDOM = function(deviceId){
	var browserImages = [document.getElementById('device-browser-1-' + deviceId),document.getElementById('device-browser-2-' + deviceId),
	                     document.getElementById('device-browser-3-' + deviceId),document.getElementById('device-browser-4-' + deviceId),
	                     document.getElementById('device-browser-5-' + deviceId),document.getElementById('device-browser-6-' + deviceId),
	                     document.getElementById('device-browser-7-' + deviceId),document.getElementById('device-browser-8-' + deviceId)];
	return browserImages;
}


