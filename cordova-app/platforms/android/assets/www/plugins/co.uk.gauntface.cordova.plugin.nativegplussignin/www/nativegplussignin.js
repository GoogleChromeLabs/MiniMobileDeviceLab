cordova.define("co.uk.gauntface.cordova.plugin.nativegplussignin.nativegplussignin", function(require, exports, module) { function NativeGPlusSignIn() {
    
}

NativeGPlusSignIn.prototype.login = function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'CordovaGPlusOauthPlugin', 'loginGPlus', []);
};

module.exports = new NativeGPlusSignIn();

});
