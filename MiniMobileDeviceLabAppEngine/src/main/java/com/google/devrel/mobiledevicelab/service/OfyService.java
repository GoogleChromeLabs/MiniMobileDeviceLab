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
package com.google.devrel.mobiledevicelab.service;

import com.google.devrel.mobiledevicelab.domain.Device;
import com.google.devrel.mobiledevicelab.domain.LabOwner;
import com.google.devrel.mobiledevicelab.domain.Url;
import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyFactory;
import com.googlecode.objectify.ObjectifyService;

/**
 * Custom Objectify Service that this application should use.
 */
public class OfyService {

  /**
   * This static block ensure the entity registration.
   */
  static {
    factory().register(Device.class);
    factory().register(LabOwner.class);
    factory().register(Url.class);
    ofy().cache(false);
  }

  /**
   * Use this static method for getting the Objectify service object in order to
   * make sure the above static block is executed before using Objectify.
   * 
   * @return Objectify service object.
   */
  public static Objectify ofy() {
    return ObjectifyService.ofy();
  }

  /**
   * Use this static method for getting the Objectify service factory.
   * 
   * @return ObjectifyFactory.
   */
  public static ObjectifyFactory factory() {
    return ObjectifyService.factory();
  }

}
