'use strict';

var INITIAL_TEST_STATUS_TIMEOUT = 30000;
var TEST_STATUS_RETRY_TIMEOUT = 10000;

var WebRequest = require('./WebRequest');
var https = require('https');

module.exports = {};

module.exports.queueUpTest = function(options) {
  var promise = new Promise(function(resolve, reject) {
    var uri = {
      'host': 'www.webpagetest.org',
      'secure': true
    };
    uri.path = '/runtest.php?';
    uri.path += 'k=' + options.key;
    uri.path += '&f=json';
    if (options.mobile) {
      uri.path += '&mobile=1';
    }
    uri.path += '&url=' + encodeURIComponent(options.url);

    WebRequest.request(uri, undefined, function(error, result) {
      if (error) {
        console.log('Error: ', error);
        return reject(new Error('WebPageTestLib: Error accessing API.', error));
      }

      if (!result.data) {
        return reject(new Error('No result data returned.'));
      }

      var cbResult = {
        'testId': result.data.testId,
        'jsonUrl': result.data.jsonUrl
      };

      resolve(cbResult);
    });
  });

  return promise;
};

function performanceTestStatusCheck(uri, cb) {
  WebRequest.request(uri, undefined, function(error, result) {
    if (error) {
      console.log('WebPageTestLib: performanceTestStatusCheck() ' +
        'Error: ', error);
      return cb(new Error('WebPageTestLib: Error accessing API.', error));
    }

    if (!result.data) {
      console.log('WebPageTestLib: performanceTestStatusCheck() ' +
        'No result data');
      return cb(new Error('No result data returned.'));
    }

    if (result.data.testsCompleted === 1) {
      return cb(null, true);
    }

    setTimeout(function() {
      performanceTestStatusCheck(uri, cb);
    }.bind(this), TEST_STATUS_RETRY_TIMEOUT);
  });
}

function getResults(resultsUrl, cb) {
  https.get(resultsUrl, function(response) {
    // Continuously update stream with data
    var body = '';
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      // Data reception is done, do whatever with it!
      cb(null, JSON.parse(body));
    });
  }).on('error', function(e) {
    console.error('WebPageTestLib: Error when getting the results.', e);
    cb(e);
  });
}

module.exports.waitForTestResults = function(options, data) {
  var promise = new Promise(function(resolve, reject) {
    var uri = {
      'host': 'www.webpagetest.org',
      'secure': true
    };
    uri.path = '/testStatus.php?';
    uri.path += 'k=' + options.key;
    uri.path += '&f=json';
    uri.path += '&test=' + data.testId;

    var cb = function(err, success) {
      if (err) {
        console.error('WebPageTestLib: Error occured when checking ' +
          'test status.');
        return reject(new Error('Error occured when checking test status.'));
      }

      if (!success) {
        console.error('WebPageTestLib: Couldn\'t get successful results ' +
          'for WPT.');
        return reject(new Error('Couldn\'t get successful results for WPT.'));
      }

      // Get the actual results YAY
      getResults(data.jsonUrl, function(err, results) {
        if (err) {
          console.error('WebPageTestLib: Error occured when checking test ' +
            'status.');
          return reject(new Error('Error occured when checking test status.'));
        }

        if (!results.data) {
          console.error('WebPageTestLib: Couldn\'t get results but test ' +
            'status is complete.');
          return reject(new Error('Couldn\'t get results but test status ' +
            'is complete.'));
        }

        resolve(results);
      }.bind(this));
    };

    setTimeout(function() {
      console.log('WebPageTestLib: Performing 1st test status check');
      performanceTestStatusCheck(uri, cb);
    }.bind(this), INITIAL_TEST_STATUS_TIMEOUT);
  });

  return promise;
};
