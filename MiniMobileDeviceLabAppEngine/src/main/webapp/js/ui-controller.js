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
  document.getElementById('devicesTable').innerHTML = '';
  if (google.devrel.mobiledevicelab.devices){
    var table = document.createElement('table');
    table.className = "device";
    var tableBody = document.createElement('tbody');
    var deviceRowTemplate = document.querySelector('#device-row-template').innerHTML;
    var deviceRowBrowserTemplate = document.querySelector('#device-row-browser-template').innerHTML;
    var deviceRowBrowserHtml = "";
    var browsers = google.devrel.mobiledevicelab.getBrowsers();
    for (var i = 0; i < browsers.length; i++) {
      deviceRowBrowserHtml = deviceRowBrowserHtml + deviceRowBrowserTemplate.replace("{{browser-index-start-at-1}}",""+(i+1));
      deviceRowBrowserHtml = deviceRowBrowserHtml.replace("{{src}}","src=" + browsers[i].icon);
      deviceRowBrowserHtml = deviceRowBrowserHtml.replace("{{alt}}","alt=" + browsers[i].name + " icon");
    }
    
    var rows = "";
    for (var i = 0; i < google.devrel.mobiledevicelab.devices.length; i++) {
      var newRow = deviceRowTemplate.replace("{{browser-row}}", deviceRowBrowserHtml);
      newRow = newRow.split("{{id}}").join(""+google.devrel.mobiledevicelab.devices[i].id);
      newRow = newRow.replace("{{device-name}}", ""+google.devrel.mobiledevicelab.devices[i].deviceName);
      newRow = newRow.replace("{{device-version}}", ""+google.devrel.mobiledevicelab.devices[i].platformVersion);
      rows = rows + newRow;
    }
    tableBody.innerHTML = rows;
    table.appendChild(tableBody);
    document.getElementById('devicesTable').appendChild(table);
    for (var i = 0; i < google.devrel.mobiledevicelab.devices.length; i++) {
      google.devrel.mobiledevicelab.enableDeviceButtons(google.devrel.mobiledevicelab.devices[i].id,google.devrel.mobiledevicelab.devices[i].deviceName);
      if (!google.devrel.mobiledevicelab.devicesState.hasOwnProperty(google.devrel.mobiledevicelab.devices[i].id)){
        google.devrel.mobiledevicelab.devicesState[google.devrel.mobiledevicelab.devices[i].id] = {browser:0, on:true, name: google.devrel.mobiledevicelab.devices[i].deviceName};
      }
      google.devrel.mobiledevicelab.devicesState[google.devrel.mobiledevicelab.devices[i].id].name = google.devrel.mobiledevicelab.devices[i].deviceName;
      google.devrel.mobiledevicelab.selectBrowser(google.devrel.mobiledevicelab.devices[i].id, google.devrel.mobiledevicelab.devicesState[google.devrel.mobiledevicelab.devices[i].id].browser);
      if (!google.devrel.mobiledevicelab.devicesState[google.devrel.mobiledevicelab.devices[i].id].on){
        google.devrel.mobiledevicelab.showDeviceEnabled(google.devrel.mobiledevicelab.devices[i].id,google.devrel.mobiledevicelab.devicesState[google.devrel.mobiledevicelab.devices[i].id].on);
      }
      document.querySelector('#toggle-'+google.devrel.mobiledevicelab.devices[i].id).checked = google.devrel.mobiledevicelab.devicesState[google.devrel.mobiledevicelab.devices[i].id].on;
    }
  }
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

  document.getElementById('getDevices').onclick = function() {
    google.devrel.mobiledevicelab.getDevices();
  }
  
  document.getElementById('android-header-checkbox').onclick = function() {
    google.devrel.mobiledevicelab.androidDevicesToggled();
  }

};

/**
 * Enable the controls for each device row
 * 
 * @param deviceId
 */
google.devrel.mobiledevicelab.enableDeviceButtons = function(deviceId, name) {
  //Handle browser selection
   var browserImages = google.devrel.mobiledevicelab.getDeviceBrowsersElementsDOM(deviceId);
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
  
    // Handle the toggle device action
    var enabledCheckbox = document.querySelector('#toggle-'+deviceId);
    enabledCheckbox.addEventListener('change',
        google.devrel.mobiledevicelab.getEnableDeviceCallback(deviceId), true);
    
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
  google.devrel.mobiledevicelab.showDeviceEnabled(deviceId, e.target.checked);
  }.bind(this);
};


/**
 * Callback when android toggle on/off is changed
 */
google.devrel.mobiledevicelab.androidDevicesToggled = function(){
  google.devrel.mobiledevicelab.androidDevicesSwitchedOff = !document.querySelector('#android-header-checkbox').checked;
  var fadeDuration = 300;
  var fadeOut = 0.1;
    if (google.devrel.mobiledevicelab.androidDevicesSwitchedOff){
      $('#devicesTable').fadeTo(fadeDuration,fadeOut);
    } else {
      $('#devicesTable').fadeTo(fadeDuration,1.0);
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
      if(enabled) {
        google.devrel.mobiledevicelab.devicesState[deviceId].on = true;
        $('#device-name-' + deviceId).fadeTo(fadeDuration,1.0);
        $('#device-version-' + deviceId).fadeTo(fadeDuration,1.0);
        google.devrel.mobiledevicelab.selectBrowser(deviceId, google.devrel.mobiledevicelab.devicesState[deviceId].browser);
        $('#delete-' + deviceId).fadeTo(fadeDuration,1.0);
        $('#edit-' + deviceId).fadeTo(fadeDuration,1.0);
      } else {
        google.devrel.mobiledevicelab.devicesState[deviceId].on = false;
        $('#device-name-' + deviceId).fadeTo(fadeDuration,fadeOut);
        $('#device-version-' + deviceId).fadeTo(fadeDuration,fadeOut);
        var browserImages = google.devrel.mobiledevicelab.getDeviceBrowsersElementsJQuery(deviceId);
        for(var i = 0; i < 8; i++) {
          browserImages[i].fadeTo(fadeDuration, fadeOut);
        }
        $('#delete-' + deviceId).fadeTo(fadeDuration,fadeOut);
        $('#edit-' + deviceId).fadeTo(fadeDuration,fadeOut);
      }
  };
  
  /**
   * 
   * Show an edit field for the device name
   * 
   * @param deviceId
   */
  google.devrel.mobiledevicelab.showEditDeviceNameMode = function(deviceId) {
    if (!google.devrel.mobiledevicelab.devicesState[deviceId].on){
      document.getElementById('devicesMessage').innerHTML = 'Cannot edit a deselected device';
      return;
    }
    document.getElementById('device-name-display-'+deviceId).style.display = 'none';
    document.getElementById('device-name-input-'+deviceId).style.display = 'inline';
    document.getElementById('device-name-input-confirm-'+deviceId).style.display = 'inline';
    document.getElementById('device-name-input-'+deviceId).value = google.devrel.mobiledevicelab.devicesState[deviceId].name;
  };

/**
 * A callback to handle browser selection
 */
google.devrel.mobiledevicelab.selectBrowser = function(deviceId, index) {
  if (!google.devrel.mobiledevicelab.devicesState[deviceId].on){
    document.getElementById('devicesMessage').innerHTML = 'Cannot select a browser for a deselected device';
    return;
  }
  google.devrel.mobiledevicelab.devicesState[deviceId].browser = index;

  var fadeDuration = 300;
  var fadeOut = 0.25;
  var browserImages = google.devrel.mobiledevicelab.getDeviceBrowsersElementsJQuery(deviceId);
  for(var i = 0; i < 8; i++) {
    if (i == index){
      browserImages[i].fadeTo(fadeDuration, 1.0);
    } else {
      browserImages[i].fadeTo(fadeDuration, fadeOut);
    }
  }
};