var googleapis = require('googleapis');
var config = require('./config');
var OAuth2 = googleapis.auth.OAuth2;

exports.getUserId = function(idToken, successCallback, errorCallback) {
    try {
        new OAuth2().verifyIdToken(idToken, config.gplusClientId,
          function(err, loginToken) {
          	if(err) {
          		console.log('gplus-controller err = '+err);
          		errorCallback(err);
          		return;
          	}

            successCallback(loginToken.getUserId());
        });
    } catch (err) {
    	console.log('gplus-controller catch() err = '+err);
        errorCallback(err.msg);
    }
};
