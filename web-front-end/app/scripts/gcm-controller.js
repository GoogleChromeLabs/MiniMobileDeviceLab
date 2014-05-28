'use strict';

/*jshint sub:true*/
function GCMController(token) {
  var idToken = token;

  this.getIDToken = function() {
    return idToken;
  };
}


GCMController.prototype.sendUrlPushMessage = function(url, deviceParams, errorCb) {
  console.log('gcm-controller: sendPushMessageUrl() url = '+url);

  var config = new Config();
  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/push/url/', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function(e) {
    console.log('gcm-controller: sendPushMessageUrl() onreadystatechange');
    if (e.target.readyState === 4) {
      console.log('gcm-controller: sendPushMessageUrl() readyState == 4');
      if(e.target.status !== 200) {
        console.log('gcm-controller: sendPushMessageUrl() error() '+xhr.responseText);
        errorCb();
        return;
      } else {
        // Success NOOP
      }
    }
  };

  var params = {
    'id_token': this.getIDToken(),
    url: url,
    'device_params': deviceParams
  };

  var paramString = JSON.stringify(params);
  xhr.send(paramString);
};

GCMController.prototype.sendUrlPushMessageToAll = function(url, errorCb) {
  console.log('gcm-controller: sendUrlPushMessageToAll() url = '+url);

  var config = new Config();
  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/push/url/all/', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function(e) {
    console.log('gcm-controller: sendPushMessageUrl() onreadystatechange');
    if (e.target.readyState === 4) {
      console.log('gcm-controller: sendPushMessageUrl() readyState == 4');
      if(e.target.status !== 200) {
        console.log('gcm-controller: sendPushMessageUrl() error() '+xhr.responseText);
        try {
          var response = JSON.parse(xhr.responseText);
          if(response.error) {
            errorCb(response.error);
          }
        } catch (exception) {
          errorCb();  
        }
        
        return;
      } else {
        // Success NOOP
      }
    }
  };

  var params = {
    'id_token': this.getIDToken(),
    url: url
  };

  var paramString = JSON.stringify(params);
  xhr.send(paramString);
};
