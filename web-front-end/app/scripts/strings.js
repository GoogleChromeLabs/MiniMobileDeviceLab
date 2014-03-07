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
define([], function () {
  'use strict';

  var strings = {};

  strings.welcomeTitle = 'Welcome to Your<br />Device Lab';
  strings.welcomeMsgs = ['Ever wanted to launch a url on a number of devices?', 'Well set-up your device lab and you\'ll be good to go.'];
  strings.signIn = 'Sign In';

  strings.deviceListLoadingTitle = 'Just getting the devices in your lab..';
  strings.deviceListTitle = 'Device Lab';
  strings.noDeviceMsgs = ['Oops, no devices in this lab.', 'Install the device lab on your Android and iPhone apps, sign in with the same Google account as this Chrome App and check back :)'];
  strings.playStore = 'Google Play';
  strings.appStore = 'App Store';
  strings.launchBtn = 'Launch';

  return strings;
});
