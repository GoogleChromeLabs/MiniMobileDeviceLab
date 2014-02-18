var googleapis = require('./../../google-api-nodejs-client');
var OAuth2 = googleapis.auth.OAuth2;

exports.getUserId = function(idToken, successCallback, errorCallback) {
    try {
        new OAuth2().verifyIdToken(idToken, function(loginToken) {
            successCallback(loginToken.getUserId());
        }, errorCallback);
    } catch (err) {
        errorCallback(err.msg);
    }
};