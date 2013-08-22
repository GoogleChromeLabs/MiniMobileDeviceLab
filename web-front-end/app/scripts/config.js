/*global define */
define([], function () {
    'use strict';

    var exports = {};

	var localhost = 'http://localhost:8888';
	var localIP = 'http://192.168.0.2:8888';
	var production = 'http://device-lab.appspot.com';

	exports.getRootUrl = function() {
		return localhost;
	}

    return exports;
});