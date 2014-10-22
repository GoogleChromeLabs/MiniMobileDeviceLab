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
 * Pojo representing a device form to edit a device on the client side.
 */
public class DeviceEditForm {

  /**
   * The id of the device
   */
  private Long deviceId;

  /**
   * The name of the device
   */
  private String deviceName;

  /**
   * The token provided by Google OAuth service.
   */
  private String token;

  /**
   * The id of the user to whom the device is registered for
   */
  private String userId;

  /**
   * Just making the default constructor private.
   */
  private DeviceEditForm() {
  }

  /**
   * Public constructor for DeviceForm.
   * 
   * @param token The token provided by Google OAuth service
   * @param deviceName The new name of the device
   * @param deviceId The id of the device to be edited
   * @param userId The id of the user to whom the device is registered
   */
  public DeviceEditForm(String token, String deviceName, long deviceId, String userId) {
    this.token = token;
    this.deviceName = deviceName;
    this.deviceId = deviceId;
    this.userId = userId;
  }

  public String getToken() {
    return token;
  }

  public String getDeviceName() {
    return deviceName;
  }

  public Long getDeviceId() {
    return deviceId;
  }

  public String getUserId() {
    return userId;
  }

}
