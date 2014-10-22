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
 * LabOwner class stores the username for the device lab owner.
 */
@Entity
public class LabOwner {

  /**
   * The userId provided by Google OAuth service, used as the datastore key.
   */
  @Id private String userId;

  /**
   * Google limits tokens to about 25 per account, so to be able to have device
   * labs > 25 devices, the concept of group is used. By default, all new users
   * are added to a new group
   */
  @Index private int groupId;

  /**
   * Just making the default constructor private.
   */
  private LabOwner() {
  }

  /**
   * Public constructor for LabOwner.
   * 
   * @param userId The userId provided by Google OAuth service
   * @param groupId The id of the group
   */
  public LabOwner(String userId, int groupId) {
    this.userId = userId;
    this.groupId = groupId;
  }

  public String getUserId() {
    return userId;
  }

  public int getGroupId() {
    return groupId;
  }

}
