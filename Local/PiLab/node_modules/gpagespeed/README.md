#gpagespeed [![Build Status](https://travis-ci.org/zrrrzzt/gpagespeed.svg?branch=master)](https://travis-ci.org/zrrrzzt/gpagespeed)

Node.js module/CLI app for analyzing a webpage with [Google PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/).

You must acquire an API key from [Google Developers Console](https://console.developers.google.com/).

If you want a nice formatted report try [psi](https://github.com/addyosmani/psi) by Addy Osmani.

##Installation
```
$ npm install gpagespeed
```

or globally for the CLI app

```
$ npm install gpagespeed -g
```

##Usage - Module

Pass an object with properties.

**url** and **key** are required, all other are optional.

You can see a list of all alternatives on the page for [Google PageSpeed standard query parameters](https://developers.google.com/speed/docs/insights/v1/getting_started#st_params).

```javascript
var pagespeed = require('gpagespeed')
  , opts = {
    url: 'http://url-to-check',
    key: 'insert-your-key'
  };

pagespeed(opts, function(err, data){
  if(err) throw err;

  console.log(data);
});
```

In addition you can choose to use request instead of googleapis and another version of the PageSpeed api (defaults to v1).

```javascript
var pagespeed = require('gpagespeed')
  , opts = {
    url: 'http://url-to-check',
    key: 'insert-your-key',
    userequest: true,
    apiversion: 'v3beta1'
  };

pagespeed(opts, function(err, data){
  if(err) throw err;

  console.log(data);
});
```


##Usage - CLI

```
$ gpagespeed <url> --key=<key>
```

Optional params for result. You can see a list of all alternatives on the page for [Google PageSpeed standard query parameters](https://developers.google.com/speed/docs/insights/v1/getting_started#st_params).

```
$ gpagespeed <url> --key=<key> --callback=<callback> --prettyprint=<true> --userIp=<userIp> --locale=<locale> --strategy=<desktop|mobile>
```

In addition you can use flags to select another version of the api (defaults to v1) and to use request instead of googlapis.

```
$ gpagespeed <url> --key=<key> --userequest=true --apiversion=<versionstring>
```


##License
MIT