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
 * setup.js
 *
 **/

var inputAppID = document.querySelector("#appID");
var inputKey = document.querySelector("#key");
var inputOnByDefault = document.querySelector("#onByDefault");
var inputTestForSW = document.querySelector("#testForServiceWorker");
var divFBKey = document.querySelector("#divFBKey");

inputTestForSW.addEventListener("change", function(e) {
  if (inputTestForSW.checked) {
    divFBKey.classList.remove("hidden");
  } else {
    divFBKey.classList.add("hidden");
  }
});

document.querySelector("#butSave").addEventListener("click", function() {
  var fbCnxSettings = {
    "fbCnxSettings": {
      "appID": inputAppID.value,
      "key": inputKey.value,
      "onByDefault": inputOnByDefault.checked,
      "testForServiceWorker": inputTestForSW.checked
    }
  };

  chrome.storage.sync.set(fbCnxSettings, function() {
    chrome.runtime.sendMessage({"setup": "ready"});
  });
});

document.querySelector("#butClear").addEventListener("click", function() {
  inputKey.value = "";
  inputAppID.value = "";
  inputOnByDefault.checked = true;
  inputTestForSW.checked = false;
  divFBKey.classList.add("hidden");
  chrome.storage.sync.clear();
});

chrome.storage.sync.get("fbCnxSettings", function(settings) {
  if (settings.fbCnxSettings !== undefined) {
    settings = settings.fbCnxSettings;
    inputAppID.value = settings.appID;
    inputKey.value = settings.key;
    inputOnByDefault.checked = settings.onByDefault;
    if (settings.testForServiceWorker) {
      inputTestForSW.checked = true;
      divFBKey.classList.remove("hidden");
    } else {
      inputTestForSW.checked = false;
      divFBKey.classList.add("hidden");
    }
  }
});