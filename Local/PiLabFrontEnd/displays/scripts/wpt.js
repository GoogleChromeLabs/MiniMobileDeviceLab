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
    template.wpt = null;
    template.loaded = true;
    return;
  }

  var urlKeyModel = new URLKeyModel(firebase);
  urlKeyModel.getKey(template.url, function(err, urlKey) {
    if (err) {
      console.error('Error get url key model: ', err);
      template.wpt = null;
      template.loaded = true;
      return;
    }

    var wptResults = firebase.child('/tests/' + urlKey + '/wpt/');
    wptResults.on('value', function(snapshot) {
      var data = snapshot.val();
      if (data) {
        template.wpt = {};
        var filteredResults = {
          avg: {
            firstView: {},
            repeatView: {}
          },
          
        };
        var groups = {
          avg: {
            firstView: {},
            repeatView: {}
          }
        };

        console.log('data.results = ', data.results);

        // Convert to seconds
        filteredResults.avg.firstView.fullyLoaded =
          data.results.avg.firstView.fullyLoaded / 1000;
        var groupName = 'negative-value';
        if (data.results.avg.firstView.fullyLoaded < 2000) {
          groupName = 'positive-value';
        } else if (data.results.avg.firstView.fullyLoaded < 4000) {
          groupName = 'even-value';
        }
        groups.avg.firstView.fullyLoaded = groupName;

        filteredResults.avg.firstView.loadtime =
          data.results.avg.firstView.loadtime / 1000;
        groupName = 'negative-value';
        if (data.results.avg.firstView.loadtime < 2000) {
          groupName = 'positive-value';
        } else if (data.results.avg.firstView.loadtime < 4000) {
          groupName = 'even-value';
        }
        groups.avg.firstView.loadtime = groupName;

        filteredResults.avg.firstView.render =
          data.results.avg.firstView.render / 1000;
        groupName = 'negative-value';
        if (data.results.avg.firstView.render < 2000) {
          groupName = 'positive-value';
        } else if (data.results.avg.firstView.render < 4000) {
          groupName = 'even-value';
        }
        groups.avg.firstView.render = groupName;

        filteredResults.avg.repeatView.fullyLoaded =
          data.results.avg.repeatView.fullyLoaded / 1000;
        groupName = 'negative-value';
        if (data.results.avg.repeatView.fullyLoaded < 1000) {
          groupName = 'positive-value';
        } else if (data.results.avg.repeatView.fullyLoaded < 2000) {
          groupName = 'even-value';
        }
        groups.avg.repeatView.fullyLoaded = groupName;

        filteredResults.avg.repeatView.loadtime =
          data.results.avg.repeatView.loadtime / 1000;
        groupName = 'negative-value';
        if (data.results.avg.repeatView.loadtime < 1000) {
          groupName = 'positive-value';
        } else if (data.results.avg.repeatView.loadtime < 2000) {
          groupName = 'even-value';
        }
        groups.avg.repeatView.loadtime = groupName;

        filteredResults.avg.repeatView.render =
          data.results.avg.repeatView.render / 1000;
        groupName = 'negative-value';
        if (data.results.avg.repeatView.render < 1000) {
          groupName = 'positive-value';
        } else if (data.results.avg.repeatView.render < 2000) {
          groupName = 'even-value';
        }
        groups.avg.repeatView.render = groupName;

        filteredResults.avg.firstView.speedIndex = data.results.avg.firstView.speedIndex
        groupName = 'negative-value';
        // These values are the 25th and avg speed index scores
        // See: https://sites.google.com/a/webpagetest.org/docs/
        // using-webpagetest/metrics/speed-index
        if (data.results.avg.firstView.speedIndex < 2191) {
          groupName = 'positive-value';
        } else if (data.results.avg.firstView.speedIndex < 4493) {
          groupName = 'even-value';
        }
        groups.avg.firstView.speedIndex = groupName;

        template.wpt.results = filteredResults;
        template.wpt.resultGroups = groups;
      } else {
        template.wpt = null;
      }

      template.loaded = true;
    }.bind(this));
  }.bind(this));
});
