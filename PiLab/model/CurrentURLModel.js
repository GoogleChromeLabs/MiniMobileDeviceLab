'use strict';

var events = require('events');

function CurrentURLModel(fb) {
  var firebase = fb;
  var currentUrl = null;
  firebase.child('url').on('value', function(snapshot) {
    var newUrl = snapshot.val();
    if (!newUrl) {
      return;
    }

    var emitUrlChange = currentUrl ? newUrl !== currentUrl : true;
    currentUrl = newUrl;
    if (emitUrlChange) {
      this.emit('URLChange', currentUrl);
    }
  }.bind(this));

  this.getFirebase = function() {
    return firebase;
  };

  this.getUrl = function() {
    if (!currentUrl) {
      return null;
    }

    return currentUrl;
  };
}

CurrentURLModel.prototype = events.EventEmitter.prototype;

CurrentURLModel.prototype.setNewUrl = function(url) {
  this.getFirebase().child('url').set(url);
};

module.exports = CurrentURLModel;
