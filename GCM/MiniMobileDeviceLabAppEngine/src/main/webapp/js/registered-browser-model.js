/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 **/
/**
 * @fileoverview
 * Provides model for registered device/browser (listen.html)
 *
  */

/** google global namespace for Google projects. */
var google = google || {};

/** devrel namespace for Google Developer Relations projects. */
google.devrel = google.devrel || {};

/** namespace for DevRel mobiledevicelab code. */
google.devrel.mobiledevicelab = google.devrel.mobiledevicelab || {};

/**
 * The registered device
 */
google.devrel.mobiledevicelab.registeredDevice = null;

/**
 * The channel the registered device/browser can listen to urls
 */
google.devrel.mobiledevicelab.channel = null;

/**
 * The socket the registered device/browser can listen to urls
 */
google.devrel.mobiledevicelab.socket = null;

