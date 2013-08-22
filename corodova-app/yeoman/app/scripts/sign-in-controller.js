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

    /**exports.loginToAccount = function(accountIndex, account, success, error) {
        if(typeof cordova === 'undefined') {
            success({userId: 1});
            return;
        }

        cordova.exec(function(args) {
            // Success Callback
            success(args);
        }, function(err) {
            // Error Callback
            error(err);
        }, "CordovaGPlusOauthPlugin", "loginToAccount", [accountIndex, account.name]);
    }**/

    return exports;
});