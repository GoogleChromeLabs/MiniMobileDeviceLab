'use strict';

function KeepScreenOnIntentHelper() {

}

KeepScreenOnIntentHelper.prototype.getKeepScreenOnIntentHandler = function() {
  return function(adbclient, deviceId) {
    var intent = this.getKeepScreenOnIntent();
    return adbclient.startActivity(deviceId, intent)
      .catch(function(err) {
        console.log('KeepScreenOnIntentHelper.js App not installed?', err);
        /**var intent = this.getInstallIntent();
        adbclient.startActivity(deviceId, intent)
          .catch(function(err) {
            // NOOP
            console.log('KeepScreenOnIntentHelper.js Second Error: ', err);
          }.bind(this));**/
      }.bind(this));
  }.bind(this);
};

KeepScreenOnIntentHelper.prototype.getInstallIntent = function() {
  var FLAG_ACTIVITY_NEW_TASK = 0x10000000;

  // NOTE: The extras prevent new tabs being opened
  var intent = {
    'wait': false,
    'action': 'android.intent.action.VIEW',
    'flags': [FLAG_ACTIVITY_NEW_TASK],
    'data': 'market://details?id=com.synetics.stay.alive'
  };
  return intent;
};

KeepScreenOnIntentHelper.prototype.getKeepScreenOnIntent = function(url) {
  // NOTE: The extras prevent new tabs being opened
  var intent = {
    'wait': true,
    'action': 'android.intent.category.LAUNCHER',
    'component': 'com.synetics.stay.alive/.main'
  };
  return intent;
};

module.exports = new KeepScreenOnIntentHelper();
