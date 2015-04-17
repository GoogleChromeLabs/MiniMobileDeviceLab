'use strict';

var template = document.querySelector('#tmpl');
template.loadingOwp = true;

var firebase = new Firebase('https://goog-lon-device-lab.firebaseio.com/');
firebase.authWithCustomToken('vdRwF7OBMMhMvtxxETmqvcpdM9JztAFrR7Qlx5yZ', function(error) {
  if (error) {
    throw new Error('Unable to auth with Firebase', error);
  }

  var queryDict = {};
  template.disableBtns = true;
  location.search.substr(1).split('&').forEach(function(item) {queryDict[item.split('=')[0]] = item.split('=')[1]});
  if (queryDict && queryDict.url) {
    template.url = queryDict.url;
  } else {
    console.error('Ooops, we really need a url here.');
    template.owp = null;
    template.loadingOwp = false;
    return;
  }

  var urlKeyModel = new URLKeyModel(firebase);
  urlKeyModel.getKey(template.url, function(err, urlKey) {
    if (err) {
      console.error('Error get url key model: ', err);
      template.owp = null;
      template.loadingOwp = false;
      return;
    }

    var owpResults = firebase.child('/tests/owp/' + urlKey + '/');
    owpResults.on('value', function(snapshot) {
      var data = snapshot.val();
      if (data) {
        template.owp = {};
        template.owp.status = data.status;
        template.owp.status.https = template.owp.status.https ? 'Yay' : 'Boo';
        template.owp.status.webManifest = template.owp.status.webManifest ? 'Yay' : 'Nope';
      } else {
        template.owp = null;
      }
      
      template.loadingOwp = false;
    }.bind(this));
  }.bind(this));
});