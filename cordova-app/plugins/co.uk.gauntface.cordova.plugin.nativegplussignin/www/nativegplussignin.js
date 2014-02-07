function NativeGPlusSignIn() {
    
}

NativeGPlusSignIn.prototype.login = function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'CordovaGPlusOauthPlugin', 'loginGPlus', []);
};

module.exports = new NativeGPlusSignIn();
