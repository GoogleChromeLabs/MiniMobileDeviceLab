# Play Services for Cordova

This is a simple Cordova plugin that adds the Google Play Services (currently v9) client library to your app.

No user interaction is required, it should be automatically detected and included by Eclipse.

## Developer Guide

If you're an app developer, there's nothing to see here.This is not a useful plugin on its own. There is no Cordova API for the Play Services.

Instead, this plugin should be used by plugin authors as a dependency, if their plugin's Android native code requires the Play Services. See for example [chrome.identity](https://github.com/MobileChromeApps/chrome-cordova/tree/master/plugins/chrome.identity).
