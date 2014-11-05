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
package com.google.devrel.mobiledevicelab.spi.helper;

import static com.google.devrel.mobiledevicelab.service.OfyService.ofy;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.api.server.spi.response.NotFoundException;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.google.appengine.api.urlfetch.HTTPHeader;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.google.devrel.mobiledevicelab.Constants;
import com.google.devrel.mobiledevicelab.domain.Device;
import com.google.devrel.mobiledevicelab.domain.LabOwner;
import com.google.devrel.mobiledevicelab.domain.Url;
import com.google.devrel.mobiledevicelab.form.DeviceEditForm;
import com.google.devrel.mobiledevicelab.form.DeviceForm;
import com.google.devrel.mobiledevicelab.form.PushUrlForm;
import com.google.devrel.mobiledevicelab.form.ResponseForm;
import com.google.devrel.mobiledevicelab.spi.DeviceLabApi;
import com.googlecode.objectify.Key;

/**
 * 
 * Static methods used by {@link DeviceLabApi}
 *
 */
public class DeviceLabApiHelper {

  private static final Logger log = Logger.getLogger(DeviceLabApiHelper.class.getName());

  /**
   * Creates a Device object, and adds the user as a lab owner if required.
   *
   * @param deviceForm A DeviceForm object sent from the client form.
   * @return Device object just created
   * @throws UnauthorizedException if the given access token and user email do
   *         not match, or we fail to send GCM message
   */
  public static Device saveDevice(final DeviceForm deviceForm) throws UnauthorizedException {
    // Verify token is valid and is for the given user id
    validateTokenForUserId(getTokenJsonFromAccessToken(deviceForm.getToken()), deviceForm
        .getUserId());

    if (deviceForm.getPlatformId() == 0) {
      // Verify GCM id
      String GCMError = pushUrlToDevice(deviceForm.getCloudMsgId(), "test", "test");
      if (GCMError != null) {
        throw new UnauthorizedException("GCMError");
      }

      LabOwner labOwner = getLabOwner(deviceForm);

      // Check we don't have device already (using cloudMsgId for matching)
      List<Device> devices =
          ofy().load().type(Device.class).filter("gcmId", deviceForm.getCloudMsgId()).list();
      if (devices.size() > 0) {
        ofy().delete().key(Key.create(Device.class, devices.get(0).getId())).now();

      }
      Device device =
          new Device(deviceForm.getDeviceName(), deviceForm
              .getPlatformVersion(), deviceForm.getCloudMsgId(), labOwner.getGroupId());
      ofy().save().entity(device).now();
      return device;
    } else {
      LabOwner labOwner = getLabOwner(deviceForm);

      String token = createChannel(deviceForm);

      Device device =
          new Device(deviceForm.getDeviceName(), deviceForm
              .getBrowserClientId(), labOwner.getGroupId(), token);
      ofy().save().entity(device).now();

      ConnectionChannelApiHelper.pushUpdateDevicesToChannel(labOwner);

      return device;
    }
  }

  /**
   * This gets the lab owner, or create it if new
   * 
   * @param deviceForm A DeviceForm object sent from the client form.
   * @return the lab owner
   */
  private static LabOwner getLabOwner(final DeviceForm deviceForm) {
    ofy().clear();
    LabOwner labOwner =
        ofy().load().key(Key.create(LabOwner.class, deviceForm.getUserId())).now();
    if (labOwner == null) {
      List<LabOwner> owners = ofy().load().type(LabOwner.class).order("groupId").list();
      int newGroupId = 0;
      for (LabOwner owner : owners) {
        if (owner.getGroupId() >= newGroupId) {
          newGroupId = owner.getGroupId() + 1;
        }
      }
      labOwner = new LabOwner(deviceForm.getUserId(), newGroupId);
      ofy().save().entity(labOwner).now();
    }
    return labOwner;
  }


  /**
   * Creates a channel for the device as given in the deviceForm and returns the
   * token associated with the channel
   * 
   * @param deviceForm A DeviceForm object sent from the client form.
   * @return the token for the newly created channel
   */
  private static String createChannel(final DeviceForm deviceForm) {
    return createChannel(deviceForm.getBrowserClientId());
  }

  /**
   * Creates a channel for the given clientId and returns the token associated
   * with the channel
   * 
   * @param clientId The clientId to create the channnel for
   * @return the token for the newly created channel
   */
  private static String createChannel(final String clientId) {
    ChannelService channelService = ChannelServiceFactory.getChannelService();
    return channelService.createChannel(clientId);
  }

  /**
   * Amends the name of a device
   *
   * @param deviceForm A DeviceEditForm object sent from the client form.
   * @return Device object amended
   * @throws NotFoundException if the device isn't found
   * @throws UnauthorizedException if the given access token and user email do
   *         not match, or we fail to send GCM message
   */
  public static Device editDevice(DeviceEditForm deviceForm) throws UnauthorizedException,
      NotFoundException {
    validateTokenForUserId(getTokenJsonFromAccessToken(deviceForm.getToken()), deviceForm
        .getUserId());
    Device device = ofy().load().key(Key.create(Device.class, deviceForm.getDeviceId())).now();
    ofy().clear();
    if (device != null) {
      LabOwner labOwner =
          ofy().load().key(Key.create(LabOwner.class, deviceForm.getUserId())).now();
      if (labOwner != null && labOwner.getGroupId() == device.getGroupId()) {
        device.update(deviceForm.getDeviceName());
        ofy().save().entity(device).now();
        ConnectionChannelApiHelper.pushNameToChannel(device.getBrowserClientId(), device
            .getDeviceName());

        return device;
      } else {
        throw new UnauthorizedException("The device doesn't belong to the group of the lab owner!");
      }
    } else {
      throw new NotFoundException("Device with id " + deviceForm.getDeviceId() + " not found");
    }
  }

  /**
   * This gets all the devices linked to the given lab owner
   *
   * @param accessToken The G+ access token for the lab owner
   * @param userId The G+ user id for the lab owner
   * @return List of matching Devices
   * @throws UnauthorizedException if the given access token and user email do
   *         not match
   */
  public static List<Device> getDevices(final String accessToken, final String userId)
      throws UnauthorizedException {
    validateTokenForUserId(getTokenJsonFromAccessToken(accessToken), userId);
    List<Device> devices = new ArrayList<Device>();
    LabOwner labOwner = ofy().load().key(Key.create(LabOwner.class, userId)).now();
    if (labOwner != null) {
      devices = ofy().load().type(Device.class).filter("groupId", labOwner.getGroupId()).list();
      ConnectionChannelApiHelper.cleanUpDisconnectedDevices(labOwner.getGroupId());
    }

    return devices;
  }

  /**
   * This registers the browser of the lab owner to receive updates
   *
   * @param accessToken The G+ access token for the lab owner
   * @param userId The G+ user id for the lab owner
   * @param clientId The clientId for the browser, to use for the Channel API
   *        for automatic refreshing of devices
   * @return The token the browser can then use to connect to the Channel API
   * @throws UnauthorizedException if the given access token and user email do
   *         not match
   */
  public static ResponseForm registerBrowserForUpdates(final String accessToken,
      final String userId,
      final String clientId)
      throws UnauthorizedException {
    ofy().clear();
    validateTokenForUserId(getTokenJsonFromAccessToken(accessToken), userId);
    log.info("Register Browser with id " + clientId);
    LabOwner labOwner = ofy().load().key(Key.create(LabOwner.class, userId)).now();
    if (!labOwner.containsClientId(clientId)) {
      labOwner.addClientId(clientId);
      ofy().save().entity(labOwner).now();
      log.info("Client Ids " + labOwner.getClientIdsStr());
    }
    String token = createChannel(clientId);
    return new ResponseForm(null, true, token);
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
  public static ResponseForm deleteDevice(final String accessToken, final String userId,
      final long deviceId) throws NotFoundException, UnauthorizedException {
    validateTokenForUserId(getTokenJsonFromAccessToken(accessToken), userId);
    Device device = ofy().load().key(Key.create(Device.class, deviceId)).now();
    if (device != null) {
      LabOwner labOwner = ofy().load().key(Key.create(LabOwner.class, userId)).now();
      if (labOwner != null && labOwner.getGroupId() == device.getGroupId()) {
        ConnectionChannelApiHelper.pushDisconnectToChannel(device.getBrowserClientId());
        ofy().delete().key(Key.create(Device.class, deviceId)).now();

        return new ResponseForm("", true, "Device with id " + deviceId + " deleted");
      } else {
        throw new UnauthorizedException("The device doesn't belong to the group of the lab owner!");
      }
    } else {
      throw new NotFoundException("Device with id " + deviceId + " not found");
    }
  }

  /**
   * This pushes a url to all Android devices associated with the group of the
   * user whose G+ token is provided
   *
   * @param pushForm A PushUrlForm object sent from the client form.
   * @return status 200 if successful, with the number of devices it was pushed
   *         to
   * @throws UnauthorizedException if the given access token and user email do
   *         not match
   */
  public static ResponseForm pushUrl(final PushUrlForm pushUrlForm) throws UnauthorizedException {
    // Verify token is valid and is for the given user id
    validateTokenForUserId(getTokenJsonFromAccessToken(pushUrlForm.getToken()), pushUrlForm
        .getUserId());

    // Get list of devices
    List<Device> devices = new ArrayList<Device>();
    int androidDevicesSuccessfullyPushedTo = 0;
    int nonAndroidDevicesSuccessfullyPushedTo = 0;
    ofy().clear();
    LabOwner labOwner = ofy().load().key(Key.create(LabOwner.class, pushUrlForm.getUserId())).now();
    String error = "";
    if (labOwner != null) {
      devices = ofy().load().type(Device.class).filter("groupId", labOwner.getGroupId()).list();
      if (devices.size() > 0) {
        for (Device device : devices) {
          String browser = pushUrlForm.getBrowserPackageNameForDeviceId(device.getId());
          if (browser != null && device.getPlatformId() == 0) {
            String errorPushing = pushUrlToDevice(device.getGcmId(), pushUrlForm.getUrl(), browser);
            if (errorPushing == null) {
              androidDevicesSuccessfullyPushedTo += 1;
            } else {
              error += errorPushing + " for device with id " + device.getId() + "\n";
            }
          } else if (pushUrlForm.isDeviceInList(device.getId()) && device.getPlatformId() == 1) {
            boolean channelPushSuccess =
                ConnectionChannelApiHelper.pushUrlToChannel(pushUrlForm, device);
            if (channelPushSuccess) {
              nonAndroidDevicesSuccessfullyPushedTo += 1;
            } else {
              error +=
                  "Device with name " + device.getDeviceName() + "appears to be disconnected\n";
            }
          } else if (browser == null && pushUrlForm.isDeviceInList(device.getId())
              && device.getPlatformId() == 0) {
            error += "No package name provided for Android device " + device.getDeviceName() + "\n";
          }
        }
      }
    }
    log.info("Android devices pushed to: " + androidDevicesSuccessfullyPushedTo);
    log.info("Non Android devices pushed to: " + nonAndroidDevicesSuccessfullyPushedTo);
    ConnectionChannelApiHelper.cleanUpDisconnectedDevices(labOwner.getGroupId());
    ConnectionChannelApiHelper.cleanUpDisconnectedLabs(labOwner);

    List<Url> urls =
        ofy().load().type(Url.class).filter("groupId", labOwner.getGroupId()).filter("url",
            pushUrlForm.getUrl()).list();
    if (urls.size() > 0) {
      urls.get(0).urlPushed();
    } else {
      Url url = new Url(pushUrlForm.getUrl(), labOwner.getGroupId());
      urls.add(url);
    }
    ofy().save().entity(urls.get(0)).now();

    return new ResponseForm(error, error.equals(""), "Url pushed to "
        + androidDevicesSuccessfullyPushedTo + " Android "
        + (androidDevicesSuccessfullyPushedTo > 1 ? "devices" : "device") + " and to "
        + nonAndroidDevicesSuccessfullyPushedTo + " non Android "
        + (nonAndroidDevicesSuccessfullyPushedTo > 1 ? "devices" : "device"));
  }


  /**
   * This gets all the urls linked to the given lab owner
   *
   * @return List of matching Url
   * @throws UnauthorizedException if the given access token and user email do
   *         not match
   */
  public static List<Url> getUrls(final String accessToken, final String userId)
      throws UnauthorizedException {
    validateTokenForUserId(getTokenJsonFromAccessToken(accessToken), userId);
    List<Url> urls = new ArrayList<Url>();
    LabOwner labOwner = ofy().load().key(Key.create(LabOwner.class, userId)).now();
    if (labOwner != null) {
      urls =
          ofy().load().type(Url.class).filter("groupId", labOwner.getGroupId()).order("-lastUsed")
              .list();
    }
    return urls;
  }

  /**
   * Calls Google account API to get the token information
   * 
   * @param accessToken
   * @return the JSON sent back by Google account API
   * @throws UnauthorizedException
   */
  private static String getTokenJsonFromAccessToken(String accessToken)
      throws UnauthorizedException {
    String tokenJson = "";
    try {
      URL url =
          new URL("https://accounts.google.com/o/oauth2/tokeninfo?access_token=" + accessToken);
      BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()));
      String line;

      while ((line = reader.readLine()) != null) {
        tokenJson += line + "\n";
      }
      reader.close();
    } catch (MalformedURLException e) {
      throw new UnauthorizedException("We couldn't verify the access token with Google");
    } catch (IOException e) {
      throw new UnauthorizedException("We couldn't verify the access token with Google");
    }
    if (tokenJson.contains("invalid_token")) {
      throw new UnauthorizedException("The access token is invalid, please refresh the page");
    }
    return tokenJson;
  }

  private static void validateTokenForUserId(String tokenJson, String userId)
      throws UnauthorizedException {
    if (!tokenJson.contains(userId)) {
      throw new UnauthorizedException("We couldn't verify the user id with Google");
    }
  }

  /**
   * @param gcmId The registration id obtained from GCM service on the device
   * @param urlStr The url to push to the device
   * @param browserPackageName The package name for the browser to push the url
   *        to on the device
   * @return null if success, or error message. Error message can be one of the
   *         following: - as directly received from GCM server, - status code
   *         received from GCm server if not 200 - one of the following
   *         exceptions: JSONException, UnsupportedEncodingException,
   *         MalformedURLException, and IOException
   */
  private static String pushUrlToDevice(String gcmId, String urlStr, String browserPackageName) {
    try {
      JSONObject json = new JSONObject();
      JSONArray array = new JSONArray().put(gcmId);
      json.put("registration_ids", array);
      JSONObject data = new JSONObject();
      data.put("url", urlStr);
      data.put("pkg", browserPackageName);
      json.put("data", data);
      String jsonString = json.toString();
      log.info("JSON payload: " + jsonString);

      com.google.appengine.api.urlfetch.HTTPResponse response;
      URL url;
      HTTPRequest httpRequest;
      String GCM_URL = "https://android.googleapis.com/gcm/send";
      url = new URL(GCM_URL);
      httpRequest = new HTTPRequest(url, HTTPMethod.POST);
      httpRequest.addHeader(new HTTPHeader("Content-Type", "application/json"));
      log.info("ApiKey: " + Constants.API_KEY);
      httpRequest.addHeader(new HTTPHeader("Authorization", "key=" + Constants.API_KEY));
      httpRequest.setPayload(jsonString.getBytes("UTF-8"));
      log.info("Sending POST request to: " + GCM_URL);


      response = URLFetchServiceFactory.getURLFetchService().fetch(httpRequest);
      String responseString = null;
      log.info("Status: " + response.getResponseCode());
      if (response.getContent() != null) {
        responseString = new String(response.getContent(), "UTF-8");
        log.info("Response " + responseString);
      }
      String GCMError = getGCMError(responseString);
      if (response.getResponseCode() == 200 && GCMError == null) {
        return null;
      } else if (response.getResponseCode() == 200 && GCMError != null) {
        return GCMError;
      } else {
        return "Status code: " + response.getResponseCode();
      }

    } catch (JSONException e1) {
      log.info("JSONException" + e1.getMessage());
    } catch (UnsupportedEncodingException e1) {
      log.info("UnsupportedEncodingException" + e1.getMessage());
    } catch (MalformedURLException e1) {
      log.info("MalformedURLException" + e1.getMessage());
    } catch (IOException e1) {
      log.info("IOException" + e1.getMessage());
    }
    return "Exception thrown - see logs";
  }


  /**
   * @param responseFromGCM The string response as received from GCM server
   * @return the error string returned by GCM server, or null if no error
   */
  private static String getGCMError(String responseFromGCM) {
    JSONObject response = new JSONObject(responseFromGCM);
    if (response.has("results")) {
      JSONArray array = response.getJSONArray("results");
      if (array.getJSONObject(0).has("error")) {
        return array.getJSONObject(0).getString("error");
      }
    }
    return null;
  }

}
