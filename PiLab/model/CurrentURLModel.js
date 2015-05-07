'use strict';

var events = require('events');

function CurrentURLModel(fb) {
  var firebase = fb;
  var currentUrlData = null;
  firebase.child('currenturl/url').on('value', function(snapshot) {
    var newUrl = snapshot.val();
    if (!newUrl) {
      return;
    }

    if (!currentUrlData) {
      currentUrlData = {};
    }

    var emitUrlChange = currentUrlData ? newUrl !== currentUrlData.url : true;
    currentUrlData.url = newUrl;
    if (emitUrlChange) {
      this.emit('URLChange', currentUrlData.url);
    }
  }.bind(this));

  firebase.child('currenturl/owp').on('value', function(snapshot) {
    if (!currentUrlData) {
      currentUrlData = {};
    }
    currentUrlData.owp = snapshot.val();
    this.emit('OWPResultsChange', currentUrlData);
  }.bind(this));

  firebase.child('currenturl/psi').on('value', function(snapshot) {
    if (!currentUrlData) {
      currentUrlData = {};
    }
    currentUrlData.psi = snapshot.val();
    this.emit('PSIResultsChange', currentUrlData);
  }.bind(this));

  firebase.child('currenturl/wpt').on('value', function(snapshot) {
    if (!currentUrlData) {
      currentUrlData = {};
    }
    currentUrlData.wpt = snapshot.val();
    this.emit('WPTResultsChange', currentUrlData);
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
  console.log('CurrentURLModel.setPSI', results);
  if (url !== this.getUrl()) {
    return;
  }

  var fbChild = this.getFirebase().child('currenturl/psi');
  if (results) {
    fbChild.set(results);
  } else {
    fbChild.remove();
  }
};

CurrentURLModel.prototype.setWPT = function(url, results) {
  console.log('CurrentURLModel.setWPT', results);
  if (url !== this.getUrl()) {
    return;
  }

  var fbChild = this.getFirebase().child('currenturl/wpt');
  if (results) {
    fbChild.set(results);
  } else {
    fbChild.remove();
  }
};

CurrentURLModel.prototype.setOWP = function(url, results) {
  console.log('CurrentURLModel.setWPT', results);
  if (url !== this.getUrl()) {
    return;
  }

  var fbChild = this.getFirebase().child('currenturl/owp');
  if (results) {
    fbChild.set(results);
  } else {
    fbChild.remove();
  }
};

module.exports = CurrentURLModel;
