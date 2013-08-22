/*global define */
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