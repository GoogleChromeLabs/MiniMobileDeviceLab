'use strict';

var os = require('os');
var events = require('events');

function CurrentURLModel(fb) {
  var firebase = fb;
  
  var currentUrl = null;
  setInterval(function() {
    firebase.child('ping').set(Date.now());
  }, 750);
  firebase.child('url').on('value', function(snapshot) {
    var newUrl = snapshot.val();
    if (!newUrl) {
      return;
    }
    firebase.child('monitor/' + this.getComputerName() + '/url').set(newUrl);
    var emitUrlChange = currentUrl ? newUrl !== currentUrl : true;
    currentUrl = newUrl;
    if (emitUrlChange) {
      this.emit('URLChange', currentUrl);
    }
  }.bind(this));

  this.getComputerName = function() {
    var computerName = os.hostname();
    if (computerName.indexOf('.') >= 0) {
      computerName = computerName.substring(0, computerName.indexOf('.'));
    }
    return computerName;
  };
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
  var firebase = this.getFirebase();
  firebase.child('monitor/' + this.getComputerName() + '/url').set(url);
  firebase.child('url').set(url);
};

module.exports = CurrentURLModel;
