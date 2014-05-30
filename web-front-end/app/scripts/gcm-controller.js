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
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
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
  var config = new Config();
  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/push/url/all/', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
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
