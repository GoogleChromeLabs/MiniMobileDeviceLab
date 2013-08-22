/*global define */
define(['google-oauth-plugin'], function (oauthPlugin) {
    'use strict';

    var localhost = 'http://localhost:8888';
    var androidEmu = 'http://10.0.2.2:8888';
    var localIP = 'http://198.51.100.126:8888';
    var production = 'http://device-lab.appspot.com';

    var exports = {};

    exports.url = production;

    return exports;
});