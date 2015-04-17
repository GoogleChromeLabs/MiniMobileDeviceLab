var google = require('googleapis')
  , request = require('request')
  , validUrl = require('valid-url')
  , apiVersion
  , pagespeedUrl
  , pagespeedonline
  ;

module.exports = function(opts, callback){

  if(!opts.key && !opts.nokey){
    return callback(new Error('Missing required param: key'), null);
  }

  if(!opts.url){
    return callback(new Error('Missing required param: url'), null);
  }

  if(opts.url && !validUrl.isWebUri(opts.url)){
    return callback(new Error('Invalid url'), null);
  }

  apiVersion = opts.apiversion || 'v1';

  if(opts.userequest){
    pagespeedUrl = 'https://www.googleapis.com/pagespeedonline/' + apiVersion + '/runPagespeed';
    request(pagespeedUrl, {qs:opts}, function(error, response, body){
      if(error){
        return callback(error, null);
      } else {
        return callback(null, body.toString());
      }
    })
  } else {
    pagespeedonline = google.pagespeedonline(apiVersion);
    pagespeedonline.pagespeedapi.runpagespeed(opts, function(error, req){
      if(error){
        return callback(error, null);
      }
      return callback(null, req);
    });
  }
};