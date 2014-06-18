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
function SitesModel(token) {
  var idToken = token;
  var cachedSites = null;

  this.getIDToken = function() {
    return idToken;
  };

  this.getCachedSites = function() {
    return cachedSites;
  };

  this.setCachedSites = function(s) {
    var sites = {};
    var site;
    for(var i = 0; i < s.length; i++) {
      site = s[i];
      sites[site.id] = site;
    }
    cachedSites = sites;

    //localStorage["sites"] = JSON.stringify(s);
  };
}

SitesModel.prototype.getSitesList = function(callback) {
  /**var sites = localStorage["sites"];
  if(sites) {
    sites = JSON.parse(sites);
  } else {
    sites = [];
  }

  this.setSites(sites);

  callback(null, sites);**/
  var sites = this.getCachedSites();
  if(sites === null) {
    this.updateCachedSites(function() {
      callback(null, this.getCachedSites());
    }.bind(this), callback);
  } else {
    callback(null, sites);
  }
};

SitesModel.prototype.updateCachedSites = function(successCb, errorCb) {
  var config = new Config();
  var idToken = this.getIDToken();

  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/urls/get/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        errorCb();
        return;
      } else {
        var response = JSON.parse(xhr.responseText);
        this.setCachedSites(response.data);
        successCb(null, response.data);
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

SitesModel.prototype.addUrlToList = function(url, callback) {
  var config = new Config();
  var idToken = this.getIDToken();

  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/urls/add/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          if(response.error && response.error.code === 'already_added') {
            // NOOP It's added
            callback('Failed to add url - URL already in the list');
          } else if(response.error && response.error.msg) {
            callback('Failed to add url: '+response.error.msg);
          } else {
            callback('Failed to add url: ');
          }
        } catch(exception) {
          callback('Failed to add url');
        }
        return;
      }
      
      var response = JSON.parse(xhr.responseText);
      var sites = this.getCachedSites();

      sites[response.data.url_id] = {
        id: response.data.url_id,
        url: url
      };

      callback();
    }
  }.bind(this);

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    errorCb('The attempt to delete the url failed.');
  };
  console.log('idToken = '+idToken);
  var paramString = 'id_token='+encodeURIComponent(idToken)+
  '&url='+encodeURIComponent(url);
  xhr.send(paramString);

};

SitesModel.prototype.onSiteEnabledChange = function(siteId, enabled) {
  var currentList = this.getSites();
  currentList[siteId].enabled = enabled;
  this.setCachedSites(currentList);
};

SitesModel.prototype.updateSiteUrl = function(siteId, url, callback) {
  var currentList = this.getSitesList(function(err, urls) {
    if(err) {
      callback(err);
    }

    currentList[siteId].url = url;
    this.setCachedSites(currentList);

    callback(null);
  });
};

SitesModel.prototype.removeUrl = function(siteId, callback) {
  /* jshint unused: false */
  var config = new Config();
  var idToken = this.getIDToken();

  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/urls/delete/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        callback('Unable to remove URL from the looper');
        return;
      } else {
        var sites = this.getCachedSites();

        delete sites[siteId];

        callback(null);
      }
    }
  }.bind(this);

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    errorCb('The attempt to delete the device failed.');
  };

  var paramString = 'id_token='+encodeURIComponent(idToken)+'&url_id='+siteId;
  xhr.send(paramString);
  /**var currentList = this.getSites();
  currentList.splice(siteId, 1);
  this.setSites(currentList);

  callback(null);**/
};
