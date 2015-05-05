'use strict';

var template = document.querySelector('#tmpl');
template.loaded = false;

var firebase = new Firebase(window.PiLab.config.firebaseUrl);
firebase.authWithCustomToken(window.PiLab.config.firebaseKey, function(error) {
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
    template.psi = null;
    template.loaded = true;
    return;
  }

  var urlKeyModel = new URLKeyModel(firebase);
  urlKeyModel.getKey(template.url, function(err, urlKey) {
    if (err) {
      console.error('Error get url key model: ', err);
      template.psi = null;
      template.loaded = true;
      return;
    }

    var psiResults = firebase.child('/tests/' + urlKey + '/psi/');
    psiResults.on('value', function(snapshot) {
      var data = snapshot.val();
      if (data) {
        template.psi = {};
        template.psi.scoreGroups = {};
        template.psi.scores = data.scores;

        var keys = Object.keys(template.psi.scores);
        for (var i = 0; i < keys.length; i++) {
          var group = 'negative-value';
          var score = template.psi.scores[keys[i]];
          if (score >= 85) {
            group = 'positive-value';
          } else if (score >= 65) {
            group = 'even-value';
          }
          template.psi.scoreGroups[keys[i]] = group;
        }

        template.loaded = true;
      } else {
        template.psi = null;
      }
    }.bind(this));
  }.bind(this));
});
