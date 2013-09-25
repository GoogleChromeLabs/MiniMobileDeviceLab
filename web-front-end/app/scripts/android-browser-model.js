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
define([], function () {
    'use strict';

    var exports = {};
    var selectedBrowser = getDefaultBrowser();

    if(Modernizr && Modernizr.localstorage) {
        var browserIndex = localStorage.getItem("selected-browser");
        if(browserIndex) {
            selectedBrowser = browserIndex;
        }
    }

    var iconDir = 'images/browser-icons/android/';
    var browsers = [
    	{
    		name: 'Chrome',
    		icon: iconDir+'chrome-icon.png',
    		pkg: 'com.android.chrome'
    	},{
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
    	},
    ];

    if(selectedBrowser >= browsers.length) {
        selectedBrowser = 0;
    }

    exports.getSupportedBrowsers = function() {
    	return browsers;
    }

    function getDefaultBrowser() {
        return 0;
    }

    exports.getSelectedBrowser = function() {
        return parseInt(selectedBrowser);
    }

    exports.setSelectedBrowser = function(browserIndex) {
        selectedBrowser = parseInt(browserIndex);
        if(Modernizr && Modernizr.localstorage) {
            localStorage.setItem("selected-browser", browserIndex);
        }
    }

    return exports;
});