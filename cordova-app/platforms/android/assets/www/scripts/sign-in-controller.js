/*global define */
define([], function () {
    'use strict';

    var exports = {};

    exports.loginInToGPlus = function(success, error) {
        console.log("sign-in-controller: loginInToGPlus()");
        cordova.exec(function(args) {
            // Success Callback
            console.log("sign-in-controller: loginInToGPlus() success");
            success(args);
        }, function(err) {
            // Error Callback
            console.log("sign-in-controller: loginInToGPlus() error");
            error(err);
        }, "CordovaGPlusOauthPlugin", "loginGPlus", []);
    }

    return exports;
});
