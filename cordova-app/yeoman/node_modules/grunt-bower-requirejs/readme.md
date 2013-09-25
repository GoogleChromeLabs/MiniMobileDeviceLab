# grunt-bower-requirejs [![Build Status](https://secure.travis-ci.org/yeoman/grunt-bower-requirejs.png?branch=master)](http://travis-ci.org/yeoman/grunt-bower-requirejs)

Automagically wire-up installed Bower components into your RequireJS config


## Getting Started

If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide, as it explains how to create a [gruntfile][Getting Started] as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:

```shell
npm install grunt-bower-requirejs --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-bower-requirejs');
```

[grunt]: http://gruntjs.com
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md


## Example usage

```js
grunt.initConfig({
	bower: {
		target: {
			rjsConfig: 'app/config.js'
		}
	}
});

grunt.loadNpmTasks('grunt-bower-requirejs');

grunt.registerTask('default', ['bower']);
```


## Documentation

When the `bower` task is run it merges the paths of installed Bower components into the `paths` property of your RequireJS config.

You trigger this task from another task in your Gruntfile or through the CLI: `grunt bower`


### rjsConfig

**Required**  
Type: `String`

Specify a relative path to your RequireJS config.

Make sure to specify the `baseUrl` property in your RequireJS config if you want to use relative paths.


### Options

#### exclude

Default: `[]`  
Type: `Array`

Specify components to be excluded from being added to the RequireJS config.

#### baseUrl

Default: `null`  
Type: `String`

Generate paths relative to a specific directory. This option is for anyone **not** using `data-main` who wishes to set their own base.


## Things to remember

### Config file

You need to already have a config.js file at the location specified by `rjsConfig`. At a minimum, the file should look like this:

``` js
requirejs.config({
	baseUrl: './',
	paths: {}
});
```

You still need to create a path for *your* js files. The grunt task will only create paths for third party libraries specified in `bower.json`.

``` js
requirejs.config({
	baseUrl: './',
	paths: {
		myComponent: 'js/myComponent.js'
	}
});
```

The task does not overwrite the config file, it just adds additional paths to it. So paths you add will be preserved. Keep in mind that if you change or remove one of your bower dependencies after you've run the task, that path will still exist in the config file and you'll need to manually remove it.

### RequireJS component

Although RequireJS does not provide a `bower.json` file, a path to `require.js` will still be created in your `rjsConfig` file. The path's name will be `requirejs`. If you are optimizing your scripts with `r.js` you can use this path to make sure RequireJS is included in your bundle.


## License

[BSD license](http://opensource.org/licenses/bsd-license.php) and copyright Google
