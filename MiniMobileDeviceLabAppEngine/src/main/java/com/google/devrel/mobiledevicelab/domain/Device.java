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
public class Device {
  /**
   * The id for the datastore key. We use automatic id assignment for entities
   * of Device class.
   */
  @Id private Long id;

  /**
   * Google limits tokens to about 25 per account, so to be able to have device
   * labs > 25 devices, the concept of group is used, so a device belongs to a
   * group and not to a user.
   */
  @Index private int groupId;

  /**
   * The name of the device
   */
  private String deviceName;

  /**
   * Android = 0, iPhone = 1
   */
  private int platformId;

  /**
   * The version of the platform, eg "4.4"
   */
  private String platformVersion;

  /**
   * The registration id for the device, provided by GCM
   */
  @Index private String gcmId;

  /**
   * Just making the default constructor private.
   */
  private Device() {
  }

  /**
   * Public constructor for Device.
   * 
   * @param deviceName The name of the device
   * @param platformId Android = 0, iPhone = 1
   * @param platformVersion The version of the platform, eg "4.4"
   * @param cloudMsgId The registration id for the device, provided by GCM
   * @param groupId The group id of the user the device belongs to
   */
  public Device(String deviceName,
      int platformId,
      String platformVersion,
      String cloudMsgId,
      int groupId) {
    this.groupId = groupId;
    this.deviceName = deviceName;
    this.platformId = platformId;
    this.platformVersion = platformVersion;
    this.gcmId = cloudMsgId;
  }

  public Long getId() {
    return id;
  }

  public int getGroupId() {
    return groupId;
  }

  public String getDeviceName() {
    return deviceName;
  }

  public int getPlatformId() {
    return platformId;
  }

  public String getPlatformVersion() {
    return platformVersion;
  }

  public String getGcmId() {
    return gcmId;
  }

  public void update(String deviceName) {
    if (deviceName != null && !deviceName.equals("")) {
      this.deviceName = deviceName;
    }
  }



}
