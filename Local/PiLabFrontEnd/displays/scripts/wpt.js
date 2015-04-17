'use strict';

var template = document.querySelector('#tmpl');
template.loadingWpt = true;

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
    template.wpt = null;
    template.loadingWpt = false;
    return;
  }

  var urlKeyModel = new URLKeyModel(firebase);
  urlKeyModel.getKey(template.url, function(err, urlKey) {
    if (err) {
      console.error('Error get url key model: ', err);
      template.wpt = null;
      template.loadingWpt = false;
      return;
    }

    var wptResults = firebase.child('/tests/wpt/' + urlKey + '/');
    wptResults.on('value', function(snapshot) {
      var data = snapshot.val();
      if (data) {
        template.wpt = {};
        var filteredResults = data.results;
        // Convert to seconds
        filteredResults.avg.firstView.fullyLoaded = filteredResults.avg.firstView.fullyLoaded / 1000;
        filteredResults.avg.firstView.loadtime = filteredResults.avg.firstView.loadtime / 1000;
        filteredResults.avg.firstView.render = filteredResults.avg.firstView.render / 1000;
        
        filteredResults.avg.repeatView.fullyLoaded = filteredResults.avg.repeatView.fullyLoaded / 1000;
        filteredResults.avg.repeatView.loadtime = filteredResults.avg.repeatView.loadtime / 1000;
        filteredResults.avg.repeatView.render = filteredResults.avg.repeatView.render / 1000;

        template.wpt.results = filteredResults;
      } else {
        template.wpt = null;
      }
      
      template.loadingWpt = false;
    }.bind(this));
  }.bind(this));
});
