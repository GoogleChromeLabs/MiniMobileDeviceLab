(function() {
  var Adb, Client, Keycode, util;

  Client = require('./adb/client');

  Keycode = require('./adb/keycode');

  util = require('./adb/util');

  Adb = (function() {
    function Adb() {}

    Adb.createClient = function(options) {
      return new Client(options);
    };

    return Adb;

  })();

  Adb.Keycode = Keycode;

  Adb.util = util;

  module.exports = Adb;

}).call(this);
