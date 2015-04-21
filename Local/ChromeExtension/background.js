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


// is the extension enabled & running
var isEnabled = false;

// handle to the current tab
var currentTab;

function openURL(url, testForServiceWorker) {
  console.log("openURL", url, testForServiceWorker);
  var tabOptions = {
    url: url,
    active: true
  };
  if (currentTab === undefined) {
    tabOptions.index = 0;
    console.log("[OpenURL] (New)", tabOptions);
    chrome.tabs.create(tabOptions, function(newTab) {
      currentTab = newTab;
      if (testForServiceWorker) {
        testPage(currentTab, url);
      }
    });
  } else {
    console.log("[OpenURL] (Existing)", tabOptions);
    chrome.tabs.update(currentTab.id, tabOptions, function(newTab) {
      // Checks if there was an error, if there was, attempt to reopen
      // the url on a new tab.
      if (chrome.runtime.lastError) {
        currentTab = undefined;
        openURL(url, testForServiceWorker);
      } else {
        // Updates the tab in case it changed due to preloading, etc
        currentTab = newTab;
        if (testForServiceWorker) {
          testPage(currentTab, url);
        }
      }
    });
  }
}

function testPage(currentTab, url) {
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
    chrome.tabs.executeScript(currentTab.id, obj);
  }, 2500);
}



function init() {
  console.warn("[INIT] TODO: handle case where save hit after already started");
  console.log("[Init]");
  chrome.storage.sync.get("fbCnxSettings", function(settings) {
    if (settings.fbCnxSettings === undefined) {
      console.log("[Init] Creating default settings");
      var fbCnxSettings = {
        "fbCnxSettings": {
          "appID": "goog-lon-device-lab",
          "key": "",
          "onByDefault": true,
          "testForServiceWorker": false
        }
      };
      chrome.storage.sync.set(fbCnxSettings);
      settings = fbCnxSettings;
    }

    settings = settings.fbCnxSettings;
    console.log("[Init] Settings: ", settings);
    
    try {
      setEnabled(settings.onByDefault);
      var fbURL = "https://" + settings.appID + ".firebaseio.com/";
      var fb = new Firebase(fbURL);
      if (settings.key === "") {
        fb.authAnonymously(function(err, authToken) {
          console.log("Anonymous Auth:", err, authToken);
          if (err) {
            openURL("setup.html");
          }
        });
      } else {
        fb.authWithCustomToken(settings.key, function(err, authToken) {
          console.log("Custom Token Auth:", err, authToken);
          if (err) {
            openURL("setup.html");
          }
        });
      }
      fb.child("url").on("value", function(snapshot) {
        if (isEnabled) {
          openURL(snapshot.val(), settings.testForServiceWorker);
        }
      });
    } catch (ex) {
      openURL("setup.html");
    }
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.serviceWorkerTest) {
    console.warn("[ServiceWorker] TODO: save service worker status");
    console.warn("[ServiceWorker] see https://github.com/GoogleChrome/MiniMobileDeviceLab/blob/next/Local/PiLab/model/URLKeyModel.js");
    console.log("[ServiceWorker]", request.url, request.hasServiceWorker);
  } else if (request.setup === "ready") {
    currentTab = undefined;
    chrome.tabs.remove(sender.tab.id);
    init();
  }
});

function setEnabled(enabled) {
  if (enabled === undefined) {
    enabled = !isEnabled;
  }
  console.log("[SetEnabled]", enabled);
  if (enabled === true) {
    isEnabled = true;
    chrome.browserAction.setBadgeText({"text": "ON"});
    chrome.power.requestKeepAwake("display");
  } else if (enabled === false) {
    isEnabled = false;
    chrome.browserAction.setBadgeText({"text": ""});
    chrome.power.releaseKeepAwake();
  }
}

chrome.browserAction.onClicked.addListener(function(tabs) {
  setEnabled();
});

init();