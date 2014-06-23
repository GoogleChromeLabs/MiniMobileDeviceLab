/**
Copyright 2013 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
'use strict';

/*jshint sub:true*/
function LoopModel(token) {
  var idToken = token;
  var looping = false;
  var delay = 30000;

  this.getIDToken = function() {
    return idToken;
  };

  this.isLooping = function() {
    return looping;
  };

  this.setIsLooping = function(isLooping) {
    looping = isLooping;
  }

  this.setLoopDelay = function(newDelay) {
    delay = parseInt(newDelay, 10);
  };

  this.getLoopDelay = function() {
    return delay;
  };
}

LoopModel.prototype.startLooping = function(callback) {
  var config = new Config();
  var idToken = this.getIDToken();

  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/urls/loopcontrol/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        callback('Unable to start looping');
        return;
      } else {
        callback(null);
      }
    }
  }.bind(this);

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    callback('The attempt to start the looper failed.');
  };

  var paramString = 'id_token='+encodeURIComponent(idToken)+'&is_looping=true&delay='+this.getLoopDelay();
  xhr.send(paramString);
};

LoopModel.prototype.endLooping = function(callback) {
  var config = new Config();
  var idToken = this.getIDToken();

  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/urls/loopcontrol/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        callback('Unable to end looping');
        return;
      } else {
        callback(null);
      }
    }
  }.bind(this);

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    callback('The attempt to end the looper failed.');
  };

  var paramString = 'id_token='+encodeURIComponent(idToken)+'&is_looping=false';
  xhr.send(paramString);
};

LoopModel.prototype.updateLoopState = function(callback) {
  var config = new Config();
  var idToken = this.getIDToken();
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', config.getRootUrl()+'/urls/loopstate/', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhr.onreadystatechange = function(e) {
    if (e.target.readyState === 4) {
      if(e.target.status !== 200) {
        callback('Unable to get the loop state');
        return;
      } else {
        var response = JSON.parse(xhr.responseText);
        this.setIsLooping(response.data.is_looping);
        callback(null);
      }
    }
  }.bind(this);

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    callback('The attempt to update the loop state failed.');
  };

  var paramString = 'id_token='+encodeURIComponent(idToken);
  xhr.send(paramString);
};