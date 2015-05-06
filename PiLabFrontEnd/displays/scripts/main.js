'use strict';

var template = document.querySelector('#tmpl');
template.loaded = false;

var queryDict = {};
location.search.substr(1).split('&').forEach(function(item) {queryDict[item.split('=')[0]] = decodeURIComponent(item.split('=')[1])});

template.url = queryDict.url;

if (!queryDict.displays) {
  queryDict.displays = 1;
}

template.results = [queryDict.displays];
for (var i = 0; i < queryDict.displays; i++) {
  console.log(queryDict['bg-' + i]);
  console.log(queryDict['result-' + i]);
  console.log(queryDict['title-' + i]);
  template.results[i] = {
    bg: queryDict['bg-' + i],
    result: queryDict['result-' + i],
    title: queryDict['title-' + i]
  };
}

template.loaded = true;
