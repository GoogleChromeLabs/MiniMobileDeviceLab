'use strict';

var WebRequest = require('./WebRequest');

module.exports = {};

module.exports.getScores = function(options) {
  var promise = new Promise(function(resolve, reject) {
    var uri = {
      host: 'www.googleapis.com',
      secure: true
    };
    uri.path = '/pagespeedonline/v3beta1/runPagespeed?';
    uri.path += 'key=' + options.key;
    uri.path += '&screenshot=false&snapshots=false&locale=en_US';
    uri.path += '&filter_third_party_resources=false';
    uri.path += '&strategy=' + options.strategy;
    uri.path += '&url=' + encodeURIComponent(options.url);

    WebRequest.request(uri, undefined, function(error, result) {
      if (error) {
        return reject(new Error('PageSpeedLib: Error accessing API.', error));
      }

      if (result.kind !== 'pagespeedonline#result') {
        return reject(new Error('Unexpected result kind returned (' + result.kind + ').'));
      }

      var cbResult = {
        score: {
          speed: result.ruleGroups.SPEED.score
        },
        pageStats: result.pageStats
      };

      if (result.ruleGroups.USABILITY && result.ruleGroups.USABILITY.score) {
        cbResult.score.ux = result.ruleGroups.USABILITY.score;
      }

      resolve(cbResult);
    });
  });

  return promise;
};
