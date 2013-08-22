'use strict';
module.exports = function (grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			]
		},
		clean: {
			test: [
				'tmp',
				'components',
				'bower_components'
			]
		},
		copy: {
			test: {
				files: {
					'tmp/config.js': 'test/fixtures/config.js',
					'tmp/global-config.js': 'test/fixtures/global-config.js',
					'tmp/baseurl-config.js': 'test/fixtures/baseurl-config.js'
				}
			}
		},
		nodeunit: {
			tasks: ['test/*_test.js']
		},
		bower: {
			options: {
				exclude: ['underscore']
			},
			standard: {
				rjsConfig: 'tmp/config.js'
			},
			global: {
				rjsConfig: 'tmp/global-config.js'
			},
			baseUrl: {
				rjsConfig: 'tmp/baseurl-config.js'
			}
		}
	});

	grunt.loadTasks('tasks');

	grunt.registerTask('mkdir', function (dir) {
		require('fs').mkdirSync(dir);
	});

	grunt.registerTask('bower-install', function () {
		require('bower').commands
			.install([
				'jquery',
				'underscore',
				'requirejs',
				'respond',
				'anima',
				'typeahead.js',
				'highstock'
			]).on('end', this.async());
	});

	grunt.registerTask('test', [
		'clean',
		'mkdir:tmp',
		'copy',
		'bower-install',
		'bower',
		'nodeunit',
		'clean'
	]);

	grunt.registerTask('default', ['test']);
};
