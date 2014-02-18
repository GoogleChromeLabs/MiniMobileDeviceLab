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

/* jshint unused: false */
function SignInController() {
    
    this.loginInToGPlus = function(success, error) {
        if(typeof cordova === 'undefined') {
            error('Cordova isn\'t available to the page');
            return;
        }

        if(typeof cordova === 'undefined') {
            error('The NativeGPlusSignIn plugin isn\'t loaded into the page');
            return;
        }

        console.log('sign-in-controller: Attempting G+ Sign In');
        nativegplussignin.login(function(args) {
            // Success
            console.log('sign-in-controller: Success - '+JSON.stringify(args));
            success(args);
        }, function(errMsg) {
            // Error
            console.log('sign-in-controller: Error - '+JSON.stringify(errMsg));
            error(errMsg);
        });
        
    };

}