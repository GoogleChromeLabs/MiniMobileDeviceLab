var googleapis = require('googleapis');
var OAuth2 = googleapis.auth.OAuth2;

exports.getUserId = function(idToken, successCallback, errorCallback) {
    try {
        new OAuth2().verifyIdToken(idToken, '148156526883-75soacsqseft7npagv6226t9pg0vtbel.apps.googleusercontent.com',
          function(err, loginToken) {
            successCallback(loginToken.getUserId());
        }, errorCallback);
    } catch (err) {
        errorCallback(err.msg);
    }
};
