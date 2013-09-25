/*global define */
define([], function () {
    'use strict';

    var exports = {};

    exports.getUserAccounts = function(success, error) {
        cordova.exec(function(args) {
            success(args);
        }, function(err) {
            error(err);
        }, "CordovaGOauthPlugin", "getUserAccounts", []);
    }

    exports.loginToAccount = function(accountIndex, account, success, error) {
        console.log("google-oauth-plugin: loginToAccount() accountIndex = "+accountIndex+" account.name = "+account.name);
        cordova.exec(function(args) {
            success(args);
        }, function(err) {
            error(err);
        }, "CordovaGOauthPlugin", "loginToAccount", [accountIndex, account.name]);
    }

    return exports;
});
