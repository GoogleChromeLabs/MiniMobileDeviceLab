'use strict';

var template = document.querySelector('#tmpl');
template.loaded = false;

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
    template.loaded = true;
    return;
  }

  var urlKeyModel = new URLKeyModel(firebase);
  urlKeyModel.getKey(template.url, function(err, urlKey) {
    if (err) {
      console.error('Error get url key model: ', err);
      template.owp = null;
      template.loaded = true;
      return;
    }

    var owpResults = firebase.child('/tests/' + urlKey + '/owp/');
    owpResults.on('value', function(snapshot) {
      var data = snapshot.val();
      if (data) {
        template.owp = {};
        template.owp.statusGroups = {};
        template.owp.status = {};

        template.owp.status.https = data.status.https ? 'Yay' : 'Boo';
        template.owp.statusGroups.https = data.status.https ?
          'positive-value' : 'negative-value';

        template.owp.status.webManifest = data.status.webManifest ?
          'Yay' : 'Nope';
        template.owp.statusGroups.webManifest = data.status.webManifest ?
          'positive-value' : 'even-value';

        template.owp.status.themeColor = data.status.themeColor ?
          'Yay' : 'Nope';
        template.owp.statusGroups.themeColor = data.status.themeColor ?
          'positive-value' : 'even-value';

        template.owp.status.serviceWorker = data.status.serviceWorker ?
          'Yay' : 'Nope';
        template.owp.statusGroups.serviceWorker = data.status.serviceWorker ?
          'positive-value' : 'negative-value';
        template.loaded = true;
      } else {
        template.owp = null;
      }
    }.bind(this));
  }.bind(this));
});
