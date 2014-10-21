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
package com.google.devrel.mobiledevicelab.spi;

import java.util.List;
import java.util.logging.Logger;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.BadRequestException;
import com.google.api.server.spi.response.NotFoundException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.utils.SystemProperty;
import com.google.devrel.mobiledevicelab.Constants;
import com.google.devrel.mobiledevicelab.domain.Device;
import com.google.devrel.mobiledevicelab.form.DeviceEditForm;
import com.google.devrel.mobiledevicelab.form.DeviceForm;
import com.google.devrel.mobiledevicelab.form.PushUrlForm;
import com.google.devrel.mobiledevicelab.form.ResponseForm;
import com.google.devrel.mobiledevicelab.spi.helper.DeviceLabApiHelper;


/**
 * Defines device APIs.
 */
@Api(
    name = "devicelab",
    version = "v1",
    scopes = {Constants.EMAIL_SCOPE},
    clientIds = {Constants.WEB_CLIENT_ID, Constants.ANDROID_CLIENT_ID,
        Constants.API_EXPLORER_CLIENT_ID},
    audiences = {Constants.ANDROID_AUDIENCE},
    description = "Device API for adding and getting devices, and pushing messages to them")
public class DeviceLabApi {

  private static final Logger log = Logger.getLogger(DeviceLabApi.class.getName());

  /**
   * Creates a Device object, and adds the user as a lab owner if required.
   *
   * @param deviceForm A DeviceForm object sent from the client form.
   * @return Device object just created
   * @throws BadRequestException if a parameter is missing in the deviceForm
   * @throws UnauthorizedException if the given access token and user email do
   *         not match, or we fail to send GCM message
   */
  @ApiMethod(name = "saveDevice", path = "devices", httpMethod = HttpMethod.POST) public Device
      saveDevice(final DeviceForm deviceForm) throws BadRequestException, UnauthorizedException {
    if (deviceForm == null) {
      throw new BadRequestException("Missing device form!");
    }
    if (deviceForm.getToken() == null) {
      throw new BadRequestException("Missing token!");
    }
    if (deviceForm.getUserId() == null) {
      throw new BadRequestException("Missing user id!");
    }
    if (deviceForm.getCloudMsgId() == null) {
      throw new BadRequestException("Missing cloud msg id!");
    }
    if (deviceForm.getDeviceName() == null) {
      throw new BadRequestException("Missing device name!");
    }
    if (deviceForm.getPlatformVersion() == null) {
      throw new BadRequestException("Missing platformVersion!");
    }
    if (deviceForm.getPlatformId() != 0 && deviceForm.getPlatformId() != 1) {
      throw new BadRequestException(
          "Invalid platform id, only 0 (Android) and 1 (iOS) are allowed!");
    }

    return DeviceLabApiHelper.saveDevice(deviceForm);
  }

  /**
   * Amends the name of a device
   *
   * @param deviceForm A DeviceEditForm object sent from the client form.
   * @return Device object amended
   * @throws NotFoundException if the device isn't found
   * @throws BadRequestException if a parameter is missing in the deviceForm
   * @throws UnauthorizedException if the given access token and user email do
   *         not match, or we fail to send GCM message
   */
  @ApiMethod(name = "editDevice", path = "devices", httpMethod = HttpMethod.PUT) public Device
      editDevice(final DeviceEditForm deviceForm) throws BadRequestException,
          UnauthorizedException, NotFoundException {
    if (deviceForm == null) {
      throw new BadRequestException("Missing device form!");
    }
    if (deviceForm.getToken() == null) {
      throw new BadRequestException("Missing token!");
    }
    if (deviceForm.getUserId() == null) {
      throw new BadRequestException("Missing user id!");
    }
    if (deviceForm.getDeviceId() == null) {
      throw new BadRequestException("Missing device id!");
    }
    if (deviceForm.getDeviceName() == null) {
      throw new BadRequestException("Missing device name!");
    }

    return DeviceLabApiHelper.editDevice(deviceForm);
  }

  /**
   * This gets all the devices linked to the given lab owner
   *
   * @return List of matching Devices
   * @throws UnauthorizedException if the given access token and user email do
   *         not match
   */
  @ApiMethod(name = "getDevices", path = "devices", httpMethod = HttpMethod.GET) public
      List<Device> getDevices(@Named("accessToken") final String accessToken,
          @Named("userId") final String userId) throws UnauthorizedException {
    return DeviceLabApiHelper.getDevices(accessToken, userId);
  }

  /**
   * This deletes the device with the given id
   *
   * @return status 200 with success = true if successful
   * @throws NotFoundException if the device with the given id is not found
   * @throws UnauthorizedException if the given access token and user email do
   *         not match, or the device doesn't belong to the group of the given
   *         user
   */
  @ApiMethod(name = "deleteDevice", path = "devices", httpMethod = HttpMethod.DELETE) public
      ResponseForm deleteDevice(@Named("accessToken") final String accessToken,
          @Named("userId") final String userId, @Named("deviceId") final long deviceId)
          throws NotFoundException, UnauthorizedException {
    return DeviceLabApiHelper.deleteDevice(accessToken, userId, deviceId);
  }


  /**
   * This pushes a url to all Android devices associated with the group of the
   * user whose G+ token is provided
   *
   * @param pushForm A PushUrlForm object sent from the client form.
   * @return status 200 if successful, with the number of devices it was pushed
   *         to
   * @throws BadRequestException if a parameter is missing in the deviceForm
   * @throws UnauthorizedException if the given access token and user email do
   *         not match
   */
  @ApiMethod(name = "pushUrl", path = "push/url", httpMethod = HttpMethod.POST) public ResponseForm
      pushUrl(final PushUrlForm pushUrlForm) throws BadRequestException, UnauthorizedException {
    log.info("Application id " + SystemProperty.applicationId.get());


    if (pushUrlForm == null) {
      throw new BadRequestException("Missing push url form!");
    }
    if (pushUrlForm.getToken() == null) {
      throw new BadRequestException("Missing token!");
    }
    if (pushUrlForm.getUserId() == null) {
      throw new BadRequestException("Missing user id!");
    }
    if (pushUrlForm.getUrl() == null || pushUrlForm.getUrl().equals("")) {
      throw new BadRequestException("Missing url!");
    }
    if (pushUrlForm.getBrowserPackageName() == null && pushUrlForm.isSameBrowserForAllDevices()) {
      throw new BadRequestException(
          "sameBrowserForAllDevices is true but no general browser package name provided");
    }
    if (!pushUrlForm.isSameBrowserForAllDevices() && pushUrlForm.getIndividualDevices().size() == 0) {
      throw new BadRequestException(
          "sameBrowserForAllDevices is false but no list of devices/browser names provided");
    }

    return DeviceLabApiHelper.pushUrl(pushUrlForm);

  }



}
