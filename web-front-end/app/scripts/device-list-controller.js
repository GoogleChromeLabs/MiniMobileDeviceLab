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

/* jshint unused:false */
function DeviceListController(token) {
  var gcmController = new GCMController(token);
  var devicesModel = new DevicesModel(token);
  var config = new Config();
  var filteredPlatforms = null;

  this.setFilteredPlatforms = function(platforms) {
    filteredPlatforms = platforms;
  };

  this.getFilteredPlatforms = function() {
    return filteredPlatforms;
  };

  this.getDevicesModel = function() {
    return devicesModel;
  };

  this.getGCMController = function() {
    return gcmController;
  };
}

DeviceListController.prototype.getPlatformLists = function(callback) {
  var platforms = this.getFilteredPlatforms();
  if(platforms !== null) {
    callback(null, platforms);
    return;
  }

  this.getDevicesModel().getPlatforms(function(platformLists) {
    var filteredPlatformLists = [];
    for(var i = 0; i < platformLists.length; i++) {
      filteredPlatformLists[i] = {
        platformId: i,
        deviceIds: platformLists[i],
        enabled: this.isPlatformEnabled(i)
      };
    }
    this.setFilteredPlatforms(filteredPlatformLists);
    callback(null, filteredPlatformLists);
  }.bind(this), function(err) {
    if(!err) {
      err = 'Unable to connect to the Device Lab Server.';
    }
    callback(err);
  });
};

DeviceListController.prototype.getDeviceById = function(id) {
  return this.getDevicesModel().getDeviceById(id);
};

DeviceListController.prototype.isPlatformEnabled = function(platformId) {
  if(Modernizr && Modernizr.localstorage) {
    var enabled = localStorage.getItem('platform-enabled-'+platformId);
    if(enabled !== null) {
      return enabled === 'true' ? true : false;
    }
  }

  return true;
};

DeviceListController.prototype.onPlatformEnabledChange = function(platformId, enabled) {
  if(Modernizr && Modernizr.localstorage) {
    console.log('onPlatformEnabledChange '+platformId+' enabled = '+enabled);
    localStorage.setItem('platform-enabled-'+platformId, enabled);
  }

  var platforms = this.getFilteredPlatforms();
  platforms[platformId].enabled = enabled;
  this.setFilteredPlatforms(platforms);
};

DeviceListController.prototype.onDeviceEnabledChange = function(deviceId, enabled) {
  var devicesModel = this.getDevicesModel();
  devicesModel.changeDeviceEnabled(deviceId, enabled);
};

DeviceListController.prototype.sendUrlPushMessage = function(url, errorCb) {
  var gcmController = this.getGCMController();

  var filteredPlatforms = this.getFilteredPlatforms();
  var pushDeviceData = [];

  for(var i = 0; i < filteredPlatforms.length; i++) {
    if(!filteredPlatforms[i].enabled) {
      continue;
    }

    var browserModel = null;
    switch(filteredPlatforms[i].platformId) {
    case 0:
      browserModel = new AndroidBrowserModel();
      break;
    }

    if(browserModel === null || browserModel.getBrowsers().length === 0) {
      continue;
    }

    var deviceIds = filteredPlatforms[i].deviceIds;
    for(var j = 0; j < deviceIds.length; j++) {
      var device = this.getDeviceById(deviceIds[j]);
      if(!device.enabled) {
        continue;
      }


      var browsers = browserModel.getBrowsers();
      var pkg = browsers[0];
      if(device.selectedBrowserIndex < browsers.length) {
        pkg = browsers[device.selectedBrowserIndex].pkg;
      }
      pushDeviceData.push({
        id: deviceIds[j],
        pkg: pkg
      });
    }
  }

  if(pushDeviceData.length === 0) {
    errorCb('No enabled devices to push to.');
    return;
  }

  gcmController.sendUrlPushMessage(url, pushDeviceData, errorCb);
};

DeviceListController.prototype.sendUrlPushMessageToAll = function(url, errorCb) {
  var gcmController = this.getGCMController();

  gcmController.sendUrlPushMessageToAll(url, errorCb);
};

/* jshint sub:true */
DeviceListController.prototype.changeDeviceNickName = function(deviceId, nickname, successCb, errorCb) {
  var device = this.getDevicesModel().getDeviceById(deviceId);
  if(device['device_nickname'] === nickname) {
    successCb();
    return;
  }

  this.getDevicesModel().changeDeviceNickName(deviceId, nickname, successCb, errorCb);
};

DeviceListController.prototype.setSelectedBrowserIndex = function(deviceId, browserIndex) {
  this.getDevicesModel().setSelectedBrowserIndex(deviceId, browserIndex);
};

DeviceListController.prototype.removeDevice = function(deviceId, successCb, errorCb) {
  this.getDevicesModel().removeDevice(deviceId, function() {
    this.setFilteredPlatforms(null);
    successCb();
  }.bind(this), errorCb);
};
