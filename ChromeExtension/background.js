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
        'appID': 'goog-lon-device-lab',
        'key': '',
        'testForServiceWorker': false,
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
    if ((currentWindow) && (currentWindow.id === windowID)) {
      currentTab = null;
      currentWindow = null;
      stopFirebase();
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
    'url': urls,
    'width': 10,
    'height': 10 
  };
  chrome.windows.create(options, function(win) {
    currentWindow = win;
    currentTab = null;
    if (callback) {
      callback(win);
    }
  });
}

function createTab(url, callback) {
  var options = {
    'url': url,
    'active': settings.grabFocus,
    'index': 0,
    'windowId': currentWindow.id
  };
  chrome.tabs.create(options, function(tab) {
    if (chrome.runtime.lastError) {
      stopFirebase();
    } else {
      currentTab = tab;
      testForServiceWorker(tab, url);
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
        testForServiceWorker(tab, url);
        currentTab = tab;
      }
    });
  } else {
    createTab(url);
  }
}

/************************************************************************
 * Test for ServiceWorkers
 ***********************************************************************/

function testForServiceWorker(tab, url) {
  if (settings.testForServiceWorker === false) {
    return;
  }
  console.log('[testForServiceWorker]', url);
  var testCode = [
    'var url = \'[URL]\';',
    'function mmdlTestForServiceWorker() {',
    '  console.log(\'running serviceWorker test...\');',
    '  if (\'serviceWorker\' in navigator) {',
    '    navigator.serviceWorker.getRegistration().then(function(registration) {',
    '      if (registration) {',
    '        // A service worker is registered for the page.',
    '        chrome.runtime.sendMessage({',
    '          \'serviceWorkerTest\': true,',
    '          \'hasServiceWorker\': true,',
    '          \'url\': url',
    '        });',
    '      } else {',
    '        // No service worker is registered',
    '        chrome.runtime.sendMessage({',
    '          \'serviceWorkerTest\': true,',
    '          \'hasServiceWorker\': false,',
    '          \'url\': url',
    '        });',
    '      }',
    '    }).catch(function(err) {',
    '      // No service worker registered because of an error',
    '      chrome.runtime.sendMessage({',
    '        \'serviceWorkerTest\': true,',
    '        \'hasServiceWorker\': false,',
    '        \'error\': err,',
    '        \'url\': url',
    '      });',
    '    });',
    '  }',
    '}',
    'mmdlTestForServiceWorker();'
  ];
  var code = testCode.join('\n');
  code = code.replace('[URL]', url);
  var obj = {
    'code': code,
    'runAt': 'document_idle'
  };
  setTimeout(function() {
    chrome.tabs.executeScript(tab.id, obj, function() {
      if (chrome.runtime.lastError) {
        /* NoOp - we don't care. */
      }
    });
  }, 2500);
}

function saveServiceWorkerResult(url, hasServiceWorker) {
  console.log('[saveServiceWorkerResult]', url, hasServiceWorker);
  fbRef.child('urlkeys').orderByValue().equalTo(url).on('value', function(snapshot) {
    var data = snapshot.val();
    if (data) {
      try {
        var keys = Object.keys(data);
        var key = 'tests/' + keys[0] + '/owp/status/serviceWorker';
        fbRef.child(key).set(hasServiceWorker);
        var historyKey = 'tests/history/' + keys[0] + '/serviceWorker';
        var historyObj = {
          'timestamp': Date.now(),
          'hasServiceWorker': hasServiceWorker,
          'url': url
        };
        fbRef.child(historyKey).push(historyObj);
      } catch (ex) {
        console.warn('[saveServiceWorkerResult] Error saving result:', ex);
      }
    }
  });
}


/************************************************************************
 * Firebase helper methods
 ***********************************************************************/
var fbRef;

// Connects to Firebase with the appID and key. If no key is provided, it
// simply uses anonymous authentication.
function startFirebase() {
  console.log('[startFirebase]');
  if (fbRef) {
    stopFirebase();
  }

  var fbURL = 'https://' + settings.appID + '.firebaseio.com/';
  fbRef = new Firebase(fbURL);
  if (settings.key) {
    console.log('[Firebase] authWithCustomToken.');
    fbRef.authWithCustomToken(settings.key, onFirebaseConnected);
  } else {
    fbRef.authAnonymously(onFirebaseConnected);
  }
}

function stopFirebase() {
  console.log('[stopFirebase]');
  if (fbRef) {
    fbRef.off();
    fbRef.unauth();
    fbRef = null;
  }
  chrome.runtime.sendMessage({'fbConnected': false});
  chrome.browserAction.setBadgeText({'text': ''});
  chrome.power.releaseKeepAwake();
}

function startListening() {
  fbRef.child('url').on('value', function(snapshot) {
   openURL(snapshot.val());
   chrome.runtime.sendMessage({'url': snapshot.val()});
  });
  chrome.browserAction.setBadgeText({'text': 'ON'});
  chrome.power.requestKeepAwake('display');
}

function onFirebaseConnected(err, authToken) {
  console.log('[onFirebaseConnect]', err, authToken);
  if (err) {
    openURL('setup.html');
  } else {
    if (currentWindow) {
      startListening();
    } else {
      createWindow('status.html', function() {
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
  } else if (request.serviceWorkerTest) {
    saveServiceWorkerResult(request.url, request.hasServiceWorker);
  }
});
