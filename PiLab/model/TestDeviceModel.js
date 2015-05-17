'use strict';

var BrowserIntentHelper = require('./../helper/BrowserIntentHelper.js');
var KeepScreenOnIntentHelper = require(
  './../helper/KeepScreenOnIntentHelper.js');

var ChromeRemoteInterface = require('chrome-remote-interface');

var themeColorSelector = {selector: 'meta[name=\'theme-color\']'};
var manifestSelector = {selector: 'link[rel=\'manifest\']'};
var serviceWorkerTest = [
'navigator.serviceWorker.getRegistration().then(',
'  function(registration) {',
'    if (registration) {',
'      console.log("___SERVICE_WORKER_TRUE");',
'    } else {',
'      console.log("___SERVICE_WORKER_FALSE");',
'    }',
'  }).catch(',
'  function() {',
'    console.log("___SERVICE_WORKER_ERROR");',
'  }',
');'];

var hasSW = {
  'expression': serviceWorkerTest.join(''),
  'returnByValue': false
};

function TestDeviceModel(deviceId, adb) {
  var adbClient = adb;
  adbClient.forward(deviceId, 'tcp:9222',
    'localabstract:chrome_devtools_remote');

  var results = {
    themeColor: null,
    manifest: null,
    sw: null
  };
  var promiseCb;
  var isCurrentlyTesting = false;

  var chromeConnection;
  setTimeout(function() {
    var keepScreenOnIntent = KeepScreenOnIntentHelper.
      getKeepScreenOnIntent();
    adbClient.startActivity(deviceId, keepScreenOnIntent);

    setTimeout(function() {
      var intent = BrowserIntentHelper.buildChromeIntent();
      adbClient.startActivity(deviceId, intent);

      setTimeout(function() {
        new ChromeRemoteInterface(function(chrome) {
          chromeConnection = chrome;
          this.prepareChrome();
        }.bind(this)).on('error', function(e) {
          console.error('Error connecting to Chrome.', e);
        });
      }.bind(this), 2000);
    }.bind(this), 3000);
  }.bind(this), 3000);

  this.checkStatus = function() {
    if (results.themeColor !== null &&
      results.manifest !== null &&
      results.sw !== null) {
      // Finished
      if (promiseCb && promiseCb.resolve) {
        promiseCb.resolve(results);
      }
      this.resetTests();
    }
  };

  this.setThemeColorSupport = function(supported) {
    results.themeColor = supported;

    this.checkStatus();
  };

  this.setManifestSupport = function(supported) {
    results.manifest = supported;

    this.checkStatus();
  };

  this.setSWSupport = function(supported) {
    results.sw = supported;

    this.checkStatus();
  };

  this.setPromiseCallbacks = function(resolve, reject) {
    promiseCb = {
      resolve: resolve,
      reject: reject
    };
  };

  this.isCurrentlyTesting = function() {
    return isCurrentlyTesting;
  };

  this.setCurrentlyTesting = function(isTesting) {
    isCurrentlyTesting = isTesting;
  };

  this.cancelTest = function() {
    if (promiseCb && promiseCb.reject) {
      promiseCb.reject();
    }
    this.resetTests();
  };

  this.resetTests = function() {
    results = {
        themeColor: null,
        manifest: null,
        sw: null
      };
    promiseCb = null;

    isCurrentlyTesting = false;
  };

  this.getChromeConnection = function() {
    return chromeConnection;
  };
}

TestDeviceModel.prototype.performTests = function(url) {
  if (this.isCurrentlyTesting()) {
    console.log('Currently testing');
    return;
  }
  this.setCurrentlyTesting(true);

  return new Promise(function(resolve, reject) {
    var chrome = this.getChromeConnection();
    if (!chrome) {
      return reject('No chrome connection');
    }

    this.setPromiseCallbacks(resolve, reject);

    chrome.Page.navigate({'url': url});
    
  }.bind(this));
};

TestDeviceModel.prototype.prepareChrome = function() {
  var chrome = this.getChromeConnection();
  chrome.on('event', function(message) {
    // listen for messages posted to the console
    if (message.method === 'Console.messageAdded') {
      // does the message start with ___service_worker
      if (message.params.message.text.indexOf('___SERVICE_WORKER') === 0) {
        var swSupported = false;
        if (message.params.message.text.indexOf(
          '___SERVICE_WORKER_TRUE') === 0) {
          swSupported = true;
        }
        this.setSWSupport(swSupported);
        // clear the console so we don't accidentally read it again later
        chrome.Console.clearMessages();
      }
    } else if (message.method === 'Page.loadEventFired') {
      this.onPageLoaded();
    }
  }.bind(this));

  // we need to enable the APIs we're going to use
  chrome.Console.enable();
  chrome.Runtime.enable();
  chrome.Network.enable();
  chrome.Page.enable();
};

TestDeviceModel.prototype.onPageLoaded = function() {
  // get the document, not sure what the first param is...
  var chrome = this.getChromeConnection();
  chrome.DOM.getDocument(function(u, dom) {
    var url = dom.root.documentURL;
    console.log('Page Load: ', url);

    // get the nodeId of the root node of the document
    themeColorSelector.nodeId = dom.root.nodeId;
    manifestSelector.nodeId = dom.root.nodeId;

    // use querySelector to get the matching elements
    chrome.DOM.querySelectorAll(themeColorSelector, function(u, elems) {
      var themeColorSet = false;
      if (elems.nodeIds && elems.nodeIds.length >= 1) {
        themeColorSet = true;
      }

      this.setThemeColorSupport(themeColorSet);
    }.bind(this));

    // use querySelector to get the matching elements
    chrome.DOM.querySelectorAll(manifestSelector, function(u, elems) {
      var manifestSet = false;
      if (elems.nodeIds && elems.nodeIds.length >= 1) {
        manifestSet = true;
      }

      this.setManifestSupport(manifestSet);
    }.bind(this));

    // execute some javascript to check for service worker
    chrome.Runtime.evaluate(hasSW);
  }.bind(this));
};

module.exports = TestDeviceModel;
