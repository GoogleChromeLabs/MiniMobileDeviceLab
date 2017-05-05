'use strict';

function URLKeyModel(fb) {
  var firebase = fb;
  
  this.getFirebase = function() {
    return firebase;
  };
}

URLKeyModel.prototype.getKey = function(url, cb) {
  var firebase = this.getFirebase();
  firebase.child('urlkeys').orderByValue().equalTo(url).on('value', function(snapshot) {
    var data = snapshot.val();
    if (!data) {
      return cb(null, null);
    }
    
    var keys = Object.keys(data);
    if (keys.length > 1) {
      cb(new Error('URLKeyModel: The URL has two keys :-S'));
    }
    return cb(null, keys[0]);
  });
};

URLKeyModel.prototype.generateKey = function(url, cb) {
  var firebase = this.getFirebase();
  firebase.child('urlkeys').orderByValue().equalTo(url).on('value', function(snapshot) {
    var data = snapshot.val();
    if (!data) {
      var newRef = firebase.child('urlkeys').push(url);
      return cb(null, newRef.key());
    }

    var keys = Object.keys(data);
    if (keys.length > 1) {
      return cb(new Error('URLKeyModel: The URL has two keys :-S'), null);
    }
    return cb(null, keys[0]);
  });
};

module.exports = URLKeyModel;
