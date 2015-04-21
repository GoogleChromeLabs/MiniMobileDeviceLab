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
 * background.js
 *
 **/


/************************************************************************
 * Settings and other initialization
 ***********************************************************************/
var settings;

function init() {
  chrome.storage.sync.get("settings", function(mmdlStorageSettings) {
    if (mmdlStorageSettings.appID === undefined) {
      console.log("[init] No settings found, using defaults.");
      settings = {
        "appID": "goog-lon-device-lab",
        "key": "",
        "testForServiceWorker": false,
        "onByDefault": true
      }
      chrome.storage.sync.set({"settings": settings});
    } else {
      settings = mmdlStorageSettings.mmdlSettings;
      console.log("[init]", settings);
    }
    settings.testForServiceWorker = true;
    if (settings.onByDefault) {
      startFirebase();
    }
  });
}

init();

/************************************************************************
 * Handle URLs
 ***********************************************************************/

function openURL(url) {
  console.log("[openURL]", url);
  chrome.tabs.query({"index": 0}, function(tab) {
    var tabProperties = {
      "url": url,
      "active": true,
      "highlighted": true
    };
    chrome.tabs.update(tab.id, tabProperties, function(tab) {
      testForServiceWorker(tab, url);
    });
  });

}

function testForServiceWorker(tab, url) {
  if (settings.testForServiceWorker === false) {
    return;
  }
  console.log("[testForServiceWorker]", url);
  var testCode = [
    "var url = '[URL]';",
    "function mmdlTestForServiceWorker() {",
    "  console.log('running serviceWorker test...');",
    "  if ('serviceWorker' in navigator) {",
    "    navigator.serviceWorker.getRegistration().then(function(registration) {",
    "      if (registration) {",
    "        // A service worker is registered for the page.",
    "        chrome.runtime.sendMessage({",
    "          'serviceWorkerTest': true,",
    "          'hasServiceWorker': true,",
    "          'url': url",
    "        });",
    "      } else {",
    "        // No service worker is registered",
    "        chrome.runtime.sendMessage({",
    "          'serviceWorkerTest': true,",
    "          'hasServiceWorker': false,",
    "          'url': url",
    "        });",
    "      }",
    "    }).catch(function(err) {",
    "      // No service worker registered because of an error",
    "      chrome.runtime.sendMessage({",
    "        'serviceWorkerTest': true,",
    "        'hasServiceWorker': false,",
    "        'error': err,",
    "        'url': url",
    "      });",
    "    });",
    "  }",
    "}",
    "mmdlTestForServiceWorker();"];
  var code = testCode.join("\n");
  code = code.replace("[URL]", url);
  var obj = {
    "code": code,
    "runAt": "document_idle"
  };
  setTimeout(function() {
    chrome.tabs.executeScript(tab.id, obj);
  }, 2500);
}


/************************************************************************
 * Firebase helper methods
 ***********************************************************************/
var fbRef;

// Connects to Firebase with the appID and key. If no key is provided, it
// simply uses anonymous authentication.
function startFirebase() {
  console.log("[startFirebase]");
  if (fbRef) {
    stopFirebase();
  }

  var fbURL = "https://" + settings.appID + ".firebaseio.com/";
  fbRef = new Firebase(fbURL);
  if (settings.key) {
    console.log("[Firebase] authWithCustomToken.");
    fbRef.authWithCustomToken(settings.key, onFirebaseConnected);
  } else {
    fbRef.authAnonymously(onFirebaseConnected);
  }
}

function stopFirebase() {
  console.log("[stopFirebase]");
  if (fbRef) {
    fbRef.off();
    fbRef.unauth();
    fbRef = null;
  }
  chrome.browserAction.setBadgeText({"text": ""});
  chrome.power.releaseKeepAwake();
}

function onFirebaseConnected(err, authToken) {
  console.log("[onFirebaseConnect]", err, authToken);
  if (err) {
    
  } else {
    fbRef.child("url").on("value", function(snapshot) {
      openURL(snapshot.val());
    });
    chrome.browserAction.setBadgeText({"text": "ON"});
    chrome.power.requestKeepAwake("display");
  }
}

function toggleFirebase() {
  if (fbRef) {
    stopFirebase();
  } else {
    startFirebase();
  }
}


/************************************************************************
 * Event Listeners
 ***********************************************************************/

chrome.browserAction.onClicked.addListener(function(tabs) {
  toggleFirebase();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("onMessage", request);
  if (request.settings) {
    settings = request.settings;
    chrome.tabs.remove(sender.tab.id);
    if ((fbRef) || (settings.onByDefault)) {
      stopFirebase();
      startFirebase();
    }
  } else if (request.serviceWorkerTest) {
    console.warn("[ServiceWorker] TODO: save service worker status");
    console.warn("[ServiceWorker] see https://github.com/GoogleChrome/MiniMobileDeviceLab/blob/next/Local/PiLab/model/URLKeyModel.js");
    console.log("[ServiceWorker]", request.url, request.hasServiceWorker);
  }
});