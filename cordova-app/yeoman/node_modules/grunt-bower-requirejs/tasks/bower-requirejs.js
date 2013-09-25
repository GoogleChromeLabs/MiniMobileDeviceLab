'use strict';
module.exports = function (grunt) {
	var path = require('path');
	var requirejs = require('requirejs/bin/r.js');
	var slash = require('slash');
	var _ = grunt.util._;

	// fixup slashes in file paths for windows
	function normalizePath(str) {
		return process.platform === 'win32' ? slash(str) : str;
	}

	// remove extensions from file paths but ignore folders
	function filterPath(str) {
		var newPath;
		if (grunt.file.isDir(str)) {
			grunt.log.writeln('Warning: ' + str + ' does not specify a .js file in main');
			newPath = str;
		} else {
			newPath = path.join(path.dirname(str), path.basename(str, '.js'));
		}
		return newPath;
	}

	// remove '.' separated extensions from library/file names
	// ex: filterName('typeahead.js', 'js') returns 'typeahead'
	// ex: filterName('foo.min.js', 'js, 'min') returns 'foo'
	function filterName(str) {
		var slice = Array.prototype.slice;
		var newName = _.difference(str.split('.'), slice.call(arguments, 1));
		if (newName.length > 1) {
			newName = newName.join('.');
		} else {
			newName = newName[0];
		}
		return newName;
	}

	grunt.registerMultiTask('bower', 'Wire-up Bower components in RJS config', function () {
		var cb = this.async();
		var excludes = this.options({exclude: []}).exclude;
		var configDir = path.dirname(this.data.rjsConfig);
		var baseUrl = this.options({ baseUrl: configDir }).baseUrl;
		var filePath = this.data.rjsConfig;
		var file = grunt.file.read(filePath);

		require('bower').commands.list({paths: true, relative: false})
			.on('end', function (data) {
				var rjsConfig;
				if (data) {
					// remove excludes and clean up key names
					data = _.forOwn(data, function (val, key, obj) {
						if (excludes.indexOf(key) !== -1) {
							delete obj[key];
							return;
						}

						// if there are multiple items for a key turn
						// them into an array
						if (val.indexOf(',') !== -1) {
							obj[key] = val.split(',');
						}

						// clean up path names like 'typeahead.js'
						// when requirejs sees the .js extension it will assume
						// an absolute path, which we don't want.
						if (key.indexOf('.js') !== -1) {
							var newKey = filterName(key, 'js');
							obj[newKey] = obj[key];
							delete obj[key];
							grunt.log.writeln('Warning: Renaming ' + key + ' to ' + newKey + '\n');
						}

						// if there's no main attribute in the bower.json file look for
						// a top level .js file. if we don't find one, or if we find too many,
						// continue to use the original value.
						if (!_.isArray(val) && grunt.file.isDir(val)) {
							// put all top level js files into an array
							var main = grunt.file.expand({ cwd: val }, '*.js', '!*.min.js');

							// if we find any Gruntfiles, remove them and log a warning.
							if (_.contains(main, 'grunt.js') || _.contains(main, 'Gruntfile.js')) {
								grunt.log.writeln('Warning: Ignoring Gruntfile in ' + key);
								grunt.log.writeln('You should inform the author to ignore this file in their bower.json\n');
								main = _.without(main, 'grunt.js', 'Gruntfile.js');
							}

							// look for a primary .js file based on the project name
							// ex: backbone.js inside backbone dir
							if (_.contains(main, path.basename(val) + '.js')) {
								main = [path.basename(val) + '.js'];
							}

							// look for a primary .js file based on the project name minus 'js'
							// ex: require.js inside requirejs dir
							if (_.contains(main, path.basename(val).replace(/js$/, '') + '.js')) {
								main = [path.basename(val).replace(/js$/, '') + '.js'];
							}

							obj[key] = main.length === 1 ? path.join(val, main[0]) : val;
						}
					});

					requirejs.tools.useLib(function (require) {
						rjsConfig = require('transform').modifyConfig(file, function (config) {
							_.forOwn(data, function(val, key, obj) {
								// if main is not an array convert it to one so we can
								// use the same process throughout
								if (!_.isArray(val)) {
									val = [val];
								}

								// iterate through the main array and filter it down
								// to only .js files
								var jsfiles = _.filter(val, function(inval) {
									return path.extname(inval) === '.js';
								});

								// if there are no js files in main, delete
								// the path and return
								if (!jsfiles.length) {
									delete obj[key];
									return;
								}

								// strip out any .js file extensions to make
								// requirejs happy
								jsfiles = _.map(jsfiles, filterPath);

								// if there were multiple js files in main create a path
								// for each using its filename.
								if (jsfiles.length > 1) {

									// remove the original key to array relationship since we're
									// splitting the component into multiple paths
									delete obj[key];

									_.forEach(jsfiles, function (jsfile) {
										var jspath = path.relative(baseUrl, jsfile);

										// clean up path names. for instance 'handlebars.js' would
										// become 'handlebars' and 'handlebars.runtime.js' would become
										// 'handlebars.runtime'
										var newKey = filterName(path.basename(jspath), 'js', 'min');

										obj[newKey] = normalizePath(jspath);
									});
								// if there was only one js file create a path
								// using the key
								} else {
									obj[key] = normalizePath(path.relative(baseUrl, jsfiles[0]));
								}
							});

							// If the original config defines paths, add the
							// bower component paths to it; otherwise, add a
							// paths map with the bower components.
							if (config.paths) {
								_.extend(config.paths, data);
							} else {
								config.paths = data;
							}

							return config;
						});

						grunt.file.write(filePath, rjsConfig);
						grunt.log.writeln('Updated RequireJS config with installed Bower components'.green);
						cb();
					});
				}
			})
			.on('error', function (err) {
				grunt.warn(err.message);
				cb();
			});
	});
};
