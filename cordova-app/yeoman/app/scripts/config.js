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

/* jshint unused: false */
'use strict';

function DeviceLabConfig() {
    var localhost = 'http://localhost:8888';
    var androidEmu = 'http://10.0.2.2:8888';
    var localIP = 'http://198.51.100.106:3000';
    var production = 'http://device-lab.appspot.com';

    this.url = localIP;
}
