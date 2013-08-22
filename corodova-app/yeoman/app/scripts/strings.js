/*global define */
define([], function () {
    'use strict';

    var exports = {};

    exports.welcome_title = "Welcome to<br />Device Lab";
    exports.welcome_msgs = ['Sign in to register this device to your lab'];
    exports.sign_in = "Sign In";
    exports.select_account_title = 'Please Select Your Account';
    exports.home_title = "Device Lab";
    exports.home_msgs = ["There isn't much you can do with this...",
    "But if you send a url from the Chrome extension, we'll be waiting and ready to handle it for you"];
    exports.log_out = "Log Out";

    return exports;
});