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
  var sites = [];

  this.getSites = function() {
    return sites;
  };

  this.setSites = function(s) {
    sites = s;

    localStorage["sites"] = JSON.stringify(s);
  };
}

SitesModel.prototype.getSitesList = function(callback) {
  var sites = localStorage["sites"];
  if(sites) {
    sites = JSON.parse(sites);
  } else {
    sites = [];
  }

  this.setSites(sites);

  callback(null, sites);
};

SitesModel.prototype.getCachedSites = function() {
  return this.getSites();
};

SitesModel.prototype.addUrlToList = function(url, callback) {
  var currentList = this.getSites();
  currentList.push({url: url, id: currentList.length, enabled: true});
  this.setSites(currentList);

  callback(null);
};

SitesModel.prototype.onSiteEnabledChange = function(siteId, enabled) {
  var currentList = this.getSites();
  currentList[siteId].enabled = enabled;
  this.setSites(currentList);
};

SitesModel.prototype.updateSiteUrl = function(siteId, url, callback) {
  var currentList = this.getSites();
  currentList[siteId].url = url;
  this.setSites(currentList);

  callback(null);
};

SitesModel.prototype.removeUrl = function(siteId, callback) {
  var currentList = this.getSites();
  currentList.splice(siteId, 1);
  this.setSites(currentList);

  callback(null);
};
