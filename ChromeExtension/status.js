/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Mini Mobile Device Lab (Chrome Extension)
 * https://github.com/GoogleChrome/MiniMobileDeviceLab
 * setup.js
 *
 **/

'use strict';

var tBody = document.querySelector('tbody');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('onMessage', request);
  if ((request.url) && (request.action === 'open')) {
    var tr = document.createElement('tr');
    var tdURL = document.createElement('td');
    tdURL.innerText = request.url;
    var tdTime = document.createElement('td');
    tdTime.innerText = moment().format('LTS');
    tr.appendChild(tdURL);
    tr.appendChild(tdTime);
    tBody.insertBefore(tr, tBody.childNodes[0]);
  }
});
