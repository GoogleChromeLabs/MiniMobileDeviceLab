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