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
    document.getElementById('devicesMessage').innerHTML = 'Obtaining your devices...';
    gapi.client.devicelab
        .getDevices({
          'accessToken' : google.devrel.mobiledevicelab.token,
          'userId' : google.devrel.mobiledevicelab.userId
        })
        .then(
            function(resp) {
              document.getElementById('devicesMessage').innerHTML = '';
              google.devrel.mobiledevicelab.devices = resp.result.items;
              google.devrel.mobiledevicelab.showDevices();
              if (!google.devrel.mobiledevicelab.devices){
                document.getElementById('devicesMessage').innerHTML = 'You have no devices. Install the Android app on a device and sign in to add a device.';
              }
            },
            function(reason) {
              document.getElementById('devicesMessage').innerHTML = 'Error getting devices. '
                  + reason.result.error.message;
            });

  }
}

/**
 * Edit the device name
 * 
 * @param id The id of the device
 */
google.devrel.mobiledevicelab.editDevice = function(id) {
  document.getElementById('device-name-display-'+id).style.display = 'inline';
  document.getElementById('device-name-input-'+id).style.display = 'none';
  document.getElementById('device-name-input-confirm-'+id).style.display = 'none';
  
  var name = document.getElementById('device-name-input-'+id).value;
  if (name != google.devrel.mobiledevicelab.devicesState[id].name){
    document.getElementById('devicesMessage').innerHTML = 'Saving new device name ' + name;
    gapi.client.devicelab
    .editDevice({
      'deviceId' : id,
      'token' : google.devrel.mobiledevicelab.token,
      'userId' : google.devrel.mobiledevicelab.userId,
      'deviceName' : name
    })
    .then(
        function(resp) {
          document.getElementById('devicesMessage').innerHTML = 'Success!';
          google.devrel.mobiledevicelab.getDevices();
        },
        function(reason) {
          document.getElementById('devicesMessage').innerHTML = 'Error updating name. '
              + reason.result.error.message;
        });
  } else {
    document.getElementById('devicesMessage').innerHTML = 'Device name unchanged';
  }
};

/**
 * Delete the device
 * 
 * @param id The id of the device
 * @param name The device name
 */
google.devrel.mobiledevicelab.deleteDevice = function(id, name) {
  if (!google.devrel.mobiledevicelab.devicesState[id].on){
    document.getElementById('devicesMessage').innerHTML = 'Cannot delete a deselected device';
    return;
  }
  document.getElementById('devicesMessage').innerHTML = 'Deleting device ' + name + ' ...';
  gapi.client.devicelab
      .deleteDevice({
        'deviceId' : id,
        'accessToken' : google.devrel.mobiledevicelab.token,
        'userId' : google.devrel.mobiledevicelab.userId
      })
      .then(
          function(resp) {
            document.getElementById('devicesMessage').innerHTML = 'Success!';
            google.devrel.mobiledevicelab.getDevices();
          },
          function(reason) {
            document.getElementById('devicesMessage').innerHTML = 'Error deleting device. '
                + reason.result.error.message;
          });
};

/**
 * Pushes a url to Android devices
 * 
 * @param {string}
 *            url to push
 */
google.devrel.mobiledevicelab.pushUrl = function(url) {
  if (google.devrel.mobiledevicelab.androidDevicesSwitchedOff){
    document.getElementById('pushMessage').innerHTML = 'Android devices toggle button is off!';
  } else {
    document.getElementById('pushMessage').innerHTML = 'Pushing url to devices...';
    var enabledDevicesAndBrowser = [];
    for (var i = 0; i < google.devrel.mobiledevicelab.devices.length; i++) {
      if (document.querySelector('#toggle-'+google.devrel.mobiledevicelab.devices[i].id).checked){
        enabledDevicesAndBrowser.push({ 
              "deviceId" : google.devrel.mobiledevicelab.devices[i].id,
              "browserPackageName"  : google.devrel.mobiledevicelab.getBrowsers()[google.devrel.mobiledevicelab.devicesState[google.devrel.mobiledevicelab.devices[i].id].browser].pkg
        });
      }
    }
    
    gapi.client.devicelab
        .pushUrl({
          'url' : url,
          'token' : google.devrel.mobiledevicelab.token,
          'userId' : google.devrel.mobiledevicelab.userId,
          'browserPackageName' : "com.android.chrome",
          'sameBrowserForAllDevices' : false,
          'individualDevices': enabledDevicesAndBrowser
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
            },
            function(reason) {
              document.getElementById('pushMessage').innerHTML = 'Error pushing url. '
                  + reason.result.error.message;
            });

  }
};