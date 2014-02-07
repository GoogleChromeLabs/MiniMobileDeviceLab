cordova.define("co.uk.gauntface.cordova.plugin.gcmbrowserlaunch.gcmlaunchbrowser", function(require, exports, module) { function GCMLaunchBrowser() {
    
}

GCMLaunchBrowser.prototype.getRegistrationId = function(successCallback, errorCallback) {
    console.log('gcmlaunchbrowser getRegistrationId');
    if(typeof cordova === 'undefined') {
        errorCallback('Cordova isn\'t available to the page');
        return;
    }

    cordova.exec(successCallback, errorCallback, 'GCMBrowserLaunch', 'getRegId', []);
};

module.exports = new GCMLaunchBrowser();

});
