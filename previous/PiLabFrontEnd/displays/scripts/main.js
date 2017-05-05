'use strict';

var template = document.querySelector('#tmpl');
template.loaded = true;
updateResults();

window.addEventListener('popstate', function(event) {
  console.log('Popstate', window.location.hash);
  updateResults();
});

function updateResults() {
  var queryDict = {};
  location.hash.substr(1).split('&').forEach(function(item) {queryDict[item.split('=')[0]] = decodeURIComponent(item.split('=')[1])});

  template.url = queryDict.url;

  if (!queryDict.displays) {
    queryDict.displays = 1;
  }

  template.displays = queryDict.displays;
  template.results = [queryDict.displays];
  for (var i = 0; i < queryDict.displays; i++) {
    template.results[i] = {
      bg: queryDict['bg-' + i],
      result: queryDict['result-' + i],
      title: queryDict['title-' + i],
      display: queryDict['result-' + i] ? true : false
    };
  }
}
