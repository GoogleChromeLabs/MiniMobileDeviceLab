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
   * Android = 0, others = 1
   */
  @Index private int platformId;

  /**
   * The version of the platform, eg "4.4"
   */
  private String platformVersion;

  /**
   * The registration id for the device, provided by GCM
   */
  @Index private String gcmId;


  /**
   * The client id of the browser for the device, as used by Channel API
   */
  @Index private String browserClientId;


  /**
   * The token the browser can use to listen on, using Channel API
   */
  private String browserToken;

  /**
   * Whether the browser is connected, using Channel API
   */
  private boolean browserConnected;

  /**
   * When the browser connected to the channel API
   */
  private long browserConnectedTime;

  /**
   * Just making the default constructor private.
   */
  private Device() {
  }

  /**
   * Public constructor for Android Device.
   * 
   * @param deviceName The name of the device
   * @param platformVersion The version of the platform, eg "4.4"
   * @param cloudMsgId The registration id for the device, provided by GCM
   * @param groupId The group id of the user the device belongs to
   */
  public Device(String deviceName,
      String platformVersion,
      String cloudMsgId,
      int groupId) {
    this.groupId = groupId;
    this.deviceName = deviceName;
    this.platformId = 0;
    this.platformVersion = platformVersion;
    this.gcmId = cloudMsgId;
  }

  /**
   * Public constructor for non Android Device.
   * 
   * @param deviceName The name of the device
   * @param browserClientId The client id of the browser for the device, as used
   *        by Channel API
   * @param groupId The group id of the user the device belongs to
   * @param browserToken The token the browser can use to listen on, using
   *        Channel API
   */
  public Device(String deviceName,
      String browserClientId,
      int groupId, String browserToken) {
    this.groupId = groupId;
    this.deviceName = deviceName;
    this.platformId = 1;
    this.browserToken = browserToken;
    this.browserClientId = browserClientId;
    this.browserConnected = false;
    this.browserConnectedTime = System.currentTimeMillis();
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

  public String getBrowserClientId() {
    return browserClientId;
  }

  public String getBrowserToken() {
    return browserToken;
  }

  public boolean isBrowserConnected() {
    return browserConnected;
  }

  public long getBrowserConnectedTime() {
    return browserConnectedTime;
  }

  public void update(String deviceName) {
    if (deviceName != null && !deviceName.equals("")) {
      this.deviceName = deviceName;
    }
  }

  public void browserConnected() {
    this.browserConnected = true;
    this.browserConnectedTime = System.currentTimeMillis();
  }

}
