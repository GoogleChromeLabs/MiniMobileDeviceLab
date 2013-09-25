/**
 * Example Gruntfile for Mocha setup
 */

'use strict';

module.exports = function(grunt) {

  var port = 8981;

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js', ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    watch: {
      // If you want to watch files and run tests automatically on change
      test: {
        files: [
          'example/js/**/*.js',
          'example/test/spec/**/*.js',
          'phantomjs/*',
          'tasks/*',
          'Gruntfile.js'
        ],
        tasks: 'test'
      }
    },
    mocha: {
      // runs all html files (except test2.html) in the test dir
      // In this example, there's only one, but you can add as many as
      // you want. You can split them up into different groups here
      // ex: admin: [ 'test/admin.html' ]
      all: ['example/test/**/!(test2|testBail).html'],

      // Runs 'test/test2.html' with specified mocha options.
      // This variant auto-includes 'bridge.js' so you do not have
      // to include it in your HTML spec file. Instead, you must add an
      // environment check before you run `mocha.run` in your HTML.
      test2: {

        // Test files
        src: ['example/test/test2.html'],
        options: {
          // mocha options
          mocha: {
            ignoreLeaks: false,
            grep: 'food'
          },

          reporter: 'Spec',

          // Indicates whether 'mocha.run()' should be executed in
          // 'bridge.js'
          run: true
        }
      },

      // Runs the same as test2 but with URL's
      test3: {
        options: {
          // mocha options
          mocha: {
            ignoreLeaks: false,
            grep: 'food'
          },

          reporter: 'Nyan',

          // URLs passed through as options
          urls: ['http://localhost:' + port + '/example/test/test2.html'],

          // Indicates whether 'mocha.run()' should be executed in
          // 'bridge.js'
          run: true
        }
      },

      // Test a failing test with bail: true
      testBail: {
        src: ['example/test/testBail.html'],
        // Bail option
        options: {
          run: true,
          bail: true
        }
      }
    },

    connect: {
      server: {
        options: {
          port: port,
          base: '.'
        }
      }
    }
  });

  // IMPORTANT: Actually load this plugin's task(s).
  // To use grunt-mocha, replace with grunt.loadNpmTasks('grunt-mocha')
  grunt.loadTasks('tasks');
  // grunt.loadNpmTasks('grunt-mocha');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Alias 'test' to 'mocha' so you can run `grunt test`
  grunt.task.registerTask('test', ['connect', 'mocha']);

  // By default, lint and run all tests.
  grunt.task.registerTask('default', ['jshint', 'test']);
};
