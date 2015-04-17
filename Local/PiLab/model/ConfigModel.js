'use strict';

var events = require('events');

function ConfigModel(fb) {
  var firebase = fb;
  var apiKeys = {};
  var mode = null;

  firebase.child('config/apiKeys').on('value', function(snapshot) {
    console.log('ConfigModel: Received api keys from Firebase');
    apiKeys = snapshot.val();
  });

  firebase.child('config/mode').on('value', function(snapshot) {
    console.log('ConfigModel: Received mode from Firebase');
    var newMode = snapshot.val();
    var shouldEmitChange = newMode !== mode;
    mode = newMode;
    if (shouldEmitChange) {
      this.emit('ModeChange', mode);
    }
  }.bind(this));

  this.getApiKey = function(apiKeyName) {
    return apiKeys[apiKeyName];
  };

  this.getMode = function() {
    if (mode !== 'loop' && mode !== 'config' && mode !== 'static') {
      console.log('ConfigModel: mode should be \'loop\', \'config\' or \'static\'. Currently it\'s: ', mode);
      return 'static';
    }
    
    return mode;
  };
}

ConfigModel.prototype = events.EventEmitter.prototype;

ConfigModel.prototype.getAPIKey = function(name) {
  var apiKeys = this.getAPIKeys();
  if (apiKeys[name]) {
    return apiKeys[name];
  }

  return null;
};

module.exports = ConfigModel;
