'use strict';

var events = require('events');

function CurrentURLModel(fb) {
  var firebase = fb;
  var url = null;
  firebase.child('url').on('value', function(snapshot) {
    url = snapshot.val();
    this.emit('URLChange', url);
  }.bind(this));

  this.getFirebase = function() {
    return firebase;
  };

  this.getUrl = function() {
    return url;
  };
}

CurrentURLModel.prototype = events.EventEmitter.prototype;

CurrentURLModel.prototype.setNewUrl = function(url) {
  this.getFirebase().child('url').set(url);
};

module.exports = CurrentURLModel;
