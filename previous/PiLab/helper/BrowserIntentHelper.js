'use strict';

function BrowserIntentHelper() {
  
}

BrowserIntentHelper.prototype.getDeviceIntentHandler = function(url) {
  return function(adbclient, deviceId) {
    var intent = this.buildChromeIntent(url);
    return adbclient.startActivity(deviceId, intent)
      .catch(function(err) {
        var intent = this.buildGenericBrowserIntent(url);
        return adbclient.startActivity(deviceId, intent)
          .catch(function(err) {
            // NOOP
          }.bind(this));
      }.bind(this));
  }.bind(this);
};

BrowserIntentHelper.prototype.buildGenericBrowserIntent = function(url) {
  var FLAG_ACTIVITY_NEW_TASK = 0x10000000;

  // NOTE: The extras prevent new tabs being opened
  var intent = {
    'wait': false,
    'action': 'android.intent.action.VIEW',
    'flags': [FLAG_ACTIVITY_NEW_TASK],
    'data': url
  };
  return intent;
};

BrowserIntentHelper.prototype.buildChromeIntent = function(url) {
  var intent = this.buildGenericBrowserIntent(url);
  intent = this.addChromeSpecifier(intent);
  return intent;
};

BrowserIntentHelper.prototype.addChromeSpecifier = function(intent) {
  var newIntent = this.addSpecificBrowser(intent, 
    'com.android.chrome/com.google.android.apps.chrome.Main');
  newIntent.extras = [
    {
      'key': 'com.android.browser.application_id',
      'type': 'string',
      'value': 'com.android.chrome'
    }
  ];
  return newIntent;
};

BrowserIntentHelper.prototype.addSpecificBrowser = function(intent, browser) {
  intent.component = browser;
  return intent;
};

module.exports = new BrowserIntentHelper();
