'use strict';

var events = require('events');
var fetch = require('node-fetch');

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
  // Check URL
  const encodeURL = encodeURIComponent(url);
  const apiKey = 'AIzaSyC9yiDIXTyotZni_W-jxL0Tq-IDkbXm-0w';
  const client = 'mmdl';
  const safeBrowsingTest = `https://sb-ssl.google.com/safebrowsing/api/lookup` +
    `?client=${client}` +
    `&key=${apiKey}` +
    `&appver=1.5.2` +
    `&pver=3.1`;
  fetch(safeBrowsingTest, {
    method: 'post',
    body: `1\n${encodeURL}`
  })
  .then(response => {
    console.log(response);
  });
  // this.getFirebase().child('url').set(url);
};

module.exports = CurrentURLModel;
