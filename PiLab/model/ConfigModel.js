'use strict';

var events = require('events');
var chalk = require('chalk');

function ConfigModel(fb) {
  var firebase = fb;
  var apiKeys = {};
  var useMode = null;
  var globalMode = null;

  this.getApiKey = function(apiKeyName) {
    if (!apiKeys) {
      return null;
    }
    return apiKeys[apiKeyName];
  };

  this.getUseMode = function() {
    if (useMode !== 'loop' && useMode !== 'static' && useMode !== 'loopPaused') {
      this.log('mode should be \'loop\', \'loopPaused\',  or \'static\'. Currently it\'s: ',
        useMode);
      return 'static';
    }

    return useMode;
  };

  this.setUseMode = function(mode) {
    if (mode !== 'loop' && mode !== 'static' && mode !== 'loopPaused') {
      this.log('mode MUST be \'loop\', \'loopPaused\',  or \'static\'.');
      return useMode;
    }
    firebase.child('config/useMode').set(mode);
    return mode;
  };

  this.getGlobalMode = function() {
    if (globalMode !== 'use' && globalMode !== 'config') {
      this.log('globalMode should be \'config\' or \'use\'. Currently it\'s: ',
        globalMode);
      return 'use';
    }

    return globalMode;
  };

  firebase.child('config/apiKeys').on('value', function(snapshot) {
    this.log('Received api keys from Firebase');
    apiKeys = snapshot.val();
  }.bind(this));

  firebase.child('config/useMode').on('value', function(snapshot) {
    this.log('Received useMode from Firebase');
    var newMode = snapshot.val();
    var shouldEmitChange = newMode !== useMode;
    useMode = newMode;
    if (shouldEmitChange && this.emit) {
      this.emit('UseModeChange', this.getUseMode());
    }
  }.bind(this));

  firebase.child('config/globalMode').on('value', function(snapshot) {
    this.log('Received globalMode from Firebase');
    var newMode = snapshot.val();
    var shouldEmitChange = newMode !== globalMode;
    globalMode = newMode;
    if (shouldEmitChange && this.emit) {
      this.emit('GlobalModeChange', this.getGlobalMode());
    }
  }.bind(this));
}

ConfigModel.prototype = events.EventEmitter.prototype;

ConfigModel.prototype.getAPIKey = function(name) {
  var apiKeys = this.getAPIKeys();
  if (apiKeys[name]) {
    return apiKeys[name];
  }

  return null;
};

ConfigModel.prototype.log = function(msg, arg) {
  if (!arg) {
    arg = '';
  }
  console.log(chalk.yellow('ConfigModel: ') + msg, arg);
};

module.exports = ConfigModel;
