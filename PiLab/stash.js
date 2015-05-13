'use strict';

var config = require('./config.json');

var https = require('https');
var fs = require('fs');
var mkdirp = require('mkdirp');
var Firebase = require('firebase');

var TEST_HISTORY_PATH = './test/history/';

mkdirp(TEST_HISTORY_PATH, function(err) {
  if (err) {
    console.error('Unable to make the ./test/history/ path');
    process.exit();
  }

  stashHistoryData();
});

function padNumber(number, length) {
  var numberString = number + '';
  length = length ? length : 2;
  var noOfZeros = length - numberString.length;
  var prefix = '';
  for (var i = 0; i < noOfZeros; i++) {
    prefix += '0';
  }

  return prefix + numberString;
}

function cleanUp() {
  var firebase = new Firebase(config.firebaseUrl);
  firebase.authWithCustomToken(config.firebaseKey, function(err, authToken) {
    if (err) {
      throw new Error(err);
    }

    firebase.child('tests').remove();

    console.log('Cleaned up firebase');
    process.exit();
  });
}

function stashHistoryData() {
  var currentDate = new Date();
  var filename = currentDate.getFullYear() + '-' +
    padNumber((currentDate.getMonth() + 1)) + '-' +
    padNumber(currentDate.getDate()) + 'T' +
    padNumber(currentDate.getHours()) + '-' +
    padNumber(currentDate.getMinutes()) + '-' +
    padNumber(currentDate.getSeconds()) + '-' +
    '-fb-data-stash.txt';

  var writeStream = fs.createWriteStream(TEST_HISTORY_PATH + filename);
  var dataDumpUrl = config.firebaseUrl + '.json?print=pretty&auth=' + config.firebaseKey;
  https.get(dataDumpUrl, function(res) {
    if (res.statusCode !== 200) {
      console.error('Unexpected status code when attempting to get the ' +
        'history data.');
      process.exit();
    }

    res.on('data', function(d) {
      writeStream.write(d);
    }.bind(this));

    res.on('end', function(d) {
      console.log('Finished saving data');
      writeStream.end(cleanUp);
    }.bind(this));

  }.bind(this)).on('error', function(e) {
    console.error('HTTPS Connection Error: ', e);
  });
}
