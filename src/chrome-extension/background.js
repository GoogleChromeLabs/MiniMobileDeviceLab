/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Mini Mobile Device Lab (Chrome Extension)
 * https://github.com/GoogleChrome/MiniMobileDeviceLab
 * background.js
 *
 **/

'use strict';

/************************************************************************
 * Settings and other initialization
 ***********************************************************************/
var settings;

function init() {
  chrome.storage.sync.get('settings', function(mmdlStorageSettings) {
    if (mmdlStorageSettings.settings === undefined) {
      console.log('[init] No settings found, using defaults.');
      settings = {
        'appID': 'goog-mtv-device-lab',
        'onByDefault': true,
        'grabFocus': true
      };
      chrome.storage.sync.set({'settings': settings});
    } else {
      settings = mmdlStorageSettings.settings;
      if (settings.grabFocus === undefined) {
        settings.grabFocus = true;
      }
      console.log('[init]', settings);
    }

    if (settings.onByDefault) {
      startFirebase();
    }
  });

  chrome.windows.onRemoved.addListener(function(windowID) {
    if ((currentWindow) && (currentWindow.id === windowID) && (fbRef)) {
      createWindow(currentURL);
    }
  });
}

init();

/************************************************************************
 * Window & Tab Handlers
 ***********************************************************************/
var currentWindow, currentTab;

function createWindow(urls, callback) {
  var options = {
    'focused': settings.grabFocus,
    'url': urls
  };
  if (navigator.userAgent.indexOf('Mozilla/5.0 (X11; CrOS') === 0) {
    options.width = screen.width,
    options.height = screen.height;
  }
  chrome.windows.create(options, function(win) {
    currentWindow = win;
    currentTab = null;
    if (callback) {
      callback(win);
    }
  });
}

function createTab(url, callback) {
  var windowId;
  try {
    windowId = currentWindow.id;
  } catch (ex) {
    createWindow(url, callback);
    return;
  }
  if (windowId === undefined) {
    createWindow(url, callback);
    return;
  }

  var options = {
    'url': url,
    'active': settings.grabFocus,
    'index': 0,
    'windowId': currentWindow.id
  };
  chrome.tabs.create(options, function(tab) {
    if (chrome.runtime.lastError) {
      startFirebase();
    } else {
      currentTab = tab;
      if (callback) {
        callback(tab);
      }  
    }
  });
}


/************************************************************************
 * Handle URLs
 ***********************************************************************/

function openURL(url) {
  console.log('[openURL]', url);

  var options = {
    'url': url,
    'active': settings.grabFocus
  };
  if (currentTab) {
    chrome.tabs.update(currentTab.id, options, function(tab) {
      if (chrome.runtime.lastError) {
        createTab(url);
      } else {
        currentTab = tab;
      }
    });
  } else {
    createTab(url);
  }
}

/************************************************************************
 * Firebase helper methods
 ***********************************************************************/
var fbRef;
var currentURL;

// Connects to Firebase with the appID and key. If no key is provided, it
// simply uses anonymous authentication.
function startFirebase() {
  console.log('[startFirebase]');
  if (fbRef) {
    stopFirebase();
  }

  var fbURL = 'https://' + settings.appID + '.firebaseio.com/';
  fbRef = new Firebase(fbURL);
  fbRef.authAnonymously(onFirebaseConnected);
}

function stopFirebase() {
  console.log('[stopFirebase]');
  if (fbRef) {
    fbRef.off();
    fbRef.unauth();
    fbRef = null;
  }
  currentTab = null;
  currentWindow = null;
  currentURL = null;
  chrome.runtime.sendMessage({'fbConnected': false});
  chrome.browserAction.setBadgeText({'text': ''});
  chrome.power.releaseKeepAwake();
}

function startListening() {
  fbRef.child('url').on('value', function(snapshot) {
    currentURL = snapshot.val();
    openURL(currentURL);
    chrome.runtime.sendMessage({'action': 'open', 'url': currentURL});
  });
  chrome.browserAction.setBadgeText({'text': 'ON'});
  chrome.power.requestKeepAwake('display');
}

function onFirebaseConnected(err, authToken) {
  console.log('[onFirebaseConnect]', err, authToken);
  if (err) {
    console.error('[Firebase Auth Failure]', err);
    console.log('Trying again...');
    startFirebase();
  } else {
    if (currentWindow) {
      startListening();
    } else {
      createWindow('about:blank', function() {
        startListening(); 
      });
    }
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
  console.log('onMessage', request);
  if (request.settings) {
    settings = request.settings;
    chrome.tabs.remove(sender.tab.id);
    if ((fbRef) || (settings.onByDefault)) {
      stopFirebase();
      startFirebase();
    }
  }
});
