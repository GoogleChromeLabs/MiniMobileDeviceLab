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
'use strict';

/*jshint sub:true*/
function DevicesModel(token) {
  var idToken = token;
  var devices = null;
  var platforms = null;

  this.getIDToken = function() {
    return idToken;
  };

  this.getCachedDevices = function() {
    return devices;
  };

  this.setCachedDevices = function(d) {
    platforms = [];
    devices = {};

    var device;
    for(var i = 0; i < d.length; i++) {
      device = d[i];
      device = this.initialiseDeviceState(device);
      if(typeof platforms[device['platform_id']] === 'undefined') {
        platforms[device['platform_id']] = [];
      }

      platforms[device['platform_id']].push(device.id);
      devices[device.id] = device;
    }
  };

  this.getCachedPlatforms = function() {
    return platforms;
  };

  this.setCachedPlatforms = function(pl) {
    this.platforms = pl;
  };

  this.setCacheDeviceBrowserIndex = function(deviceId, browserIndex) {
    devices[deviceId].selectedBrowserIndex = browserIndex;
  };
}

DevicesModel.prototype.getDevices = function(successCb, errorCb) {
  var devices = this.getCachedDevices();
  if(devices === null) {
    this.updateCachedDevices(function() {
      successCb(this.getCachedDevices());
    }.bind(this), errorCb);
  } else {
    successCb(devices);
  }
};

DevicesModel.prototype.getPlatforms = function(successCb, errorCb) {
  var platforms = this.getCachedPlatforms();
  if(platforms === null) {
    if(this.getCachedDevices() === null) {
      // We haven't initialised
      this.updateCachedDevices(function() {
        successCb(this.getCachedPlatforms());
      }.bind(this), errorCb);
    } else {
      // Devices exist, but we just have no valid platforms
      successCb([]);
    }
  } else {
    successCb(platforms);
  }
};


DevicesModel.prototype.updateCachedDevices = function(successCb, errorCb) {
  var config = new Config();
  var idToken = this.getIDToken();

  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/devices/get/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        errorCb();
        return;
      } else {
        var response = JSON.parse(xhr.responseText);
        this.setCachedDevices(response.data);
        successCb();
      }
    }
  }.bind(this);

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    errorCb('The attempt to update your device list timed out.');
  };

  var paramString = 'id_token='+encodeURIComponent(idToken);
  xhr.send(paramString);
};

DevicesModel.prototype.initialiseDeviceState = function(device) {
  var deviceEnabled = true;
  var selectedBrowserIndex = 0;
  if(Modernizr && Modernizr.localstorage) {
    var enabled = localStorage.getItem('device-enabled-'+device.id);
    if(enabled !== null) {
      deviceEnabled  = enabled === 'true' ? true : false;
    }

    selectedBrowserIndex = this.getSelectedBrowserIndex(device.id);
  }

  device.enabled = deviceEnabled;
  device.selectedBrowserIndex = selectedBrowserIndex;

  return device;
};

DevicesModel.prototype.getDeviceById = function(deviceId) {
  return this.getCachedDevices()[deviceId];
};

DevicesModel.prototype.removeDevice = function(deviceId, successCb, errorCb) {
  /* jshint unused: false */
  var config = new Config();
  var idToken = this.getIDToken();

  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/device/delete/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        console.log('e.target.status = '+e.target.status);
        errorCb();
        return;
      } else {
        var devices = this.getCachedDevices();
        var platforms = this.getCachedPlatforms();

        var device = devices[deviceId];
        var platformDeviceList = platforms[device['platform_id']];
        var index = platformDeviceList.indexOf(deviceId);

        platformDeviceList.splice(index, 1);

        delete devices[deviceId];

        successCb();
      }
    }
  }.bind(this);

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    errorCb('The attempt to delete the device failed.');
  };

  var paramString = 'id_token='+encodeURIComponent(idToken)+'&device_id='+deviceId;
  xhr.send(paramString);
};

DevicesModel.prototype.changeDeviceNickName = function(deviceId, nickname, successCb, errorCb) {
  var config = new Config();
  var idToken = this.getIDToken();

  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/device/edit/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        errorCb();
        return;
      } else {
        var devices = this.getCachedDevices();

        devices[deviceId]['device_nickname'] = nickname;

        successCb();
      }
    }
  }.bind(this);

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    errorCb('The attempt to delete the device failed.');
  };

  var paramString = 'id_token='+encodeURIComponent(idToken)+
  '&device_id='+deviceId+
  '&device_nickname='+nickname;
  xhr.send(paramString);
};

DevicesModel.prototype.getSelectedBrowserIndex = function(deviceId) {
  var index = localStorage.getItem('device-browser-index-'+deviceId);
  if(index !== null) {
    return parseInt(index, 10);
  }

  return 0;
};

DevicesModel.prototype.setSelectedBrowserIndex = function(deviceId, selectedBrowserIndex) {
  if(Modernizr && Modernizr.localstorage) {
    localStorage.setItem('device-browser-index-'+deviceId, selectedBrowserIndex);
  }

  this.setCacheDeviceBrowserIndex(deviceId, selectedBrowserIndex);
};
