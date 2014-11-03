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
package com.google.devrel.mobiledevicelab.form;

/**
 * Pojo representing a device form on the client side.
 */
public class DeviceForm {
  /**
   * The token provided by Google OAuth service.
   */
  private String token;

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
  private String cloudMsgId;

  /**
   * The id of the user to whom the device is registered for
   */
  private String userId;

  /**
   * The client id of the browser for the device, as used by Channel API
   */
  private String browserClientId;

  /**
   * Just making the default constructor private.
   */
  private DeviceForm() {
  }

  /**
   * Public constructor for DeviceForm.
   * 
   * @param token The token provided by Google OAuth service
   * @param deviceName The name of the device
   * @param platformId Android = 0, iPhone = 1
   * @param platformVersion The version of the platform, eg "4.4"
   * @param cloudMsgId The registration id for the device, provided by GCM
   * @param userId The id of the user to whom the device is registered for
   */
  /**
   * public DeviceForm(String token, String deviceName, int platformId, String
   * platformVersion, String cloudMsgId, String userId) { this.token = token;
   * this.deviceName = deviceName; this.platformId = platformId;
   * this.platformVersion = platformVersion; this.cloudMsgId = cloudMsgId;
   * this.userId = userId; }
   **/

  public String getToken() {
    return token;
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

  public String getCloudMsgId() {
    return cloudMsgId;
  }

  public String getUserId() {
    return userId;
  }

  public String getBrowserClientId() {
    return browserClientId;
  }

}
