/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Mini Mobile Device Lab (Chrome Extension)
 * https://github.com/GoogleChrome/MiniMobileDeviceLab
 * swtest.js
 *
 **/

// Checks to see if a serviceWorker has been registered for the current page.
function mmdlTestForServiceWorker(params) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(function(registration) {
      if (registration) {
        // A service worker is registered for the page.
        chrome.runtime.sendMessage({
          "serviceWorkerTest": true,
          "hasServiceWorker": true,
          "params": params
        });
      } else {
        // No service worker is registered
        chrome.runtime.sendMessage({
          "serviceWorkerTest": true,
          "hasServiceWorker": false,
          "params": params
        });
      }
    }).catch(function(err) {
      // No service worker registered because of an error
      chrome.runtime.sendMessage({
        "serviceWorkerTest": true,
        "hasServiceWorker": false,
        "error": err,
        "params": params
      });
    });
  }
}