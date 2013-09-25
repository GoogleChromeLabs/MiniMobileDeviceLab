/*
 * grunt-open
 * https://github.com/joverson/grunt-open
 *
 * Copyright (c) 2012 Jarrod Overson
 * Licensed under the MIT license.
 */

'use strict';

var open = require('open');

module.exports = function(grunt) {
  grunt.registerMultiTask('open', 'Open urls and files from a grunt task', function() {
    var dest = this.data.url || this.data.file || this.data.path;
    var application = this.data.app || this.data.application;

    function callback(error){
    if (error !== null)
      grunt.fail.warn(error);
    }

    open(dest, application, callback);

    // give the spawn some time before its parent (us) dies
    // https://github.com/onehealth/grunt-open/issues/6
    setTimeout(this.async(), 200);
  });
};
