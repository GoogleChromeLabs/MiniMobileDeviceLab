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
package com.google.devrel.mobiledevicelab.domain;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

/**
 * Device class stores device information.
 */
@Entity
public class Url {

  /**
   * The id for the datastore key. We use automatic id assignment for entities
   * of Url class.
   */
  @Id private Long id;

  /**
   * The url
   */
  @Index private String url;

  /**
   * When the url was last pushed to a device
   */
  @Index private long lastUsed;

  /**
   * The id of the group linked to the url
   */
  @Index private int groupId;

  /**
   * Just making the default constructor private.
   */
  private Url() {
  }

  /**
   * Public constructor for Url.
   * 
   * @param url The url
   * @param groupId The id of the group linked to the url
   */
  public Url(String url, int groupId) {
    this.url = url;
    this.lastUsed = System.currentTimeMillis();
    this.groupId = groupId;
  }

  public Long getId() {
    return id;
  }

  public String getUrl() {
    return url;
  }

  public void urlPushed() {
    this.lastUsed = System.currentTimeMillis();
  }

}
