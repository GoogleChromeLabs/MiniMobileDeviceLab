'use strict';

var events = require('events');

function CurrentURLModel(fb) {
  var firebase = fb;
  var currentUrlData = null;
  firebase.child('currenturl').on('value', function(snapshot) {
    var newdata = snapshot.val();
    if (!newdata) {
      return;
    }

    var emitUrlChange = currentUrlData ? newdata.url !== currentUrlData.url : true;
    currentUrlData = newdata;

    if (emitUrlChange) {
      this.emit('URLChange', currentUrlData.url);
    } else {
      this.emit('URLResultsChange', currentUrlData);
    }
  }.bind(this));

  this.getFirebase = function() {
    return firebase;
  };

  this.getUrl = function() {
    if (!currentUrlData) {
      return null;
    }

    return currentUrlData.url;
  };

  this.getData = function() {
    if (!currentUrlData) {
      return {};
    }
    return currentUrlData;
  };
}

CurrentURLModel.prototype = events.EventEmitter.prototype;

CurrentURLModel.prototype.setNewUrl = function(url) {
  this.getFirebase().child('currenturl').set({url: url});
};

CurrentURLModel.prototype.setPSI = function(url, results) {
  if (url !== this.getUrl()) {
    return;
  }

  this.getFirebase().child('currenturl/psi').set(results);
};

CurrentURLModel.prototype.setWPT = function(url, results) {
  if (url !== this.getUrl()) {
    return;
  }

  this.getFirebase().child('currenturl/wpt').set(results);
};

CurrentURLModel.prototype.setOWP = function(url, results) {
  if (url !== this.getUrl()) {
    return;
  }

  this.getFirebase().child('currenturl/owp').set(results);
};

module.exports = CurrentURLModel;
