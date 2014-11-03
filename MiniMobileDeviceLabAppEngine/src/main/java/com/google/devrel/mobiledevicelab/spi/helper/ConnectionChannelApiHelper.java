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

import java.util.List;
import java.util.logging.Logger;

import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.google.devrel.mobiledevicelab.domain.Device;
import com.google.devrel.mobiledevicelab.domain.LabOwner;
import com.google.devrel.mobiledevicelab.form.PushUrlForm;


/**
 * 
 * Static methods used to communicate with browsers over the channel api
 * connection
 *
 */
public class ConnectionChannelApiHelper {

  private static final Logger log = Logger.getLogger(ConnectionChannelApiHelper.class.getName());


  /**
   * 
   * This pushes the url as a message to the open Channel
   * 
   * @param pushUrlForm A PushUrlForm object sent from the client form.
   * @param device The device to push the url to
   * @return always true
   */
  public static boolean pushUrlToChannel(final PushUrlForm pushUrlForm, Device device) {
    ChannelService channelService = ChannelServiceFactory.getChannelService();
    channelService
        .sendMessage(new ChannelMessage(device.getBrowserClientId(), pushUrlForm.getUrl()));
    return true;
  }

  /**
   * 
   * This pushes a disconnect message to the open Channel
   * 
   * @param clientId the id of the client to inform to disconnect
   * @return always true
   */
  public static boolean pushDisconnectToChannel(String clientId) {
    if (clientId != null) {
      ChannelService channelService = ChannelServiceFactory.getChannelService();
      channelService
          .sendMessage(new ChannelMessage(clientId, "disconnect"));
    }
    return true;
  }

  /**
   * 
   * This pushes a message with the new name of the device to the open Channel
   * 
   * @param clientId the id of the client to inform of new name
   * @param name The new name of the device
   * @return always true
   */
  public static boolean pushNameToChannel(String clientId, String name) {
    if (clientId != null) {
      ChannelService channelService = ChannelServiceFactory.getChannelService();
      channelService
          .sendMessage(new ChannelMessage(clientId, "name:" + name));
    }
    return true;
  }

  /**
   * This pushes a message to all channels for the lab owner to update the
   * devices
   * 
   * @param owner
   * @return always true
   */
  public static boolean pushUpdateDevicesToChannel(LabOwner owner) {
    String[] clientIds = owner.getClientIdsWithTime();
    if (clientIds != null) {
      log.info("pushUpdateDevicesToChannel Client Ids " + clientIds.length);
    } else {
      log.info("pushUpdateDevicesToChannel Client Ids " + null);
    }
    if (clientIds != null) {
      ChannelService channelService = ChannelServiceFactory.getChannelService();
      for (int i = 0; i < clientIds.length; i++) {
        log.info(clientIds[i]);
        channelService
            .sendMessage(new ChannelMessage(clientIds[i].split(LabOwner.TIME_SEP)[0], "update"));
      }
    }
    return true;
  }

  /**
   * This iterates over all devices connected via channel API for the given
   * groupId and removes them after 2 hours (which is max time for channel
   * connection)
   */
  public static void cleanUpDisconnectedDevices(int groupId) {
    long now = System.currentTimeMillis();
    long twohours = 2l * 60 * 60 * 1000;
    List<Device> connectedDevices =
        ofy().load().type(Device.class).filter("platformId", 1).filter("groupId", groupId).list();
    for (Device device : connectedDevices) {
      if (device.getBrowserConnectedTime() < now - twohours) {
        pushDisconnectToChannel(device.getBrowserClientId());
        ofy().delete().entity(device);
      }
    }

  }

  /**
   * This iterates over all labs connected via channel API for the given lab
   * owner and removes them after 2 hours (which is max time for channel
   * connection)
   * 
   * @param labOwner
   * 
   */
  public static void cleanUpDisconnectedLabs(LabOwner labOwner) {
    log.info("clean up disconnected labs labOwner " + labOwner.getClientIdsStr());

    long now = System.currentTimeMillis();
    long twohours = 2l * 60 * 60 * 1000;
    String[] clientIdsWithTime = labOwner.getClientIdsWithTime();
    if (clientIdsWithTime != null) {
      for (int i = 0; i < clientIdsWithTime.length; i++) {
        String[] splitOnTimeSep = clientIdsWithTime[i].split(LabOwner.TIME_SEP);
        if (splitOnTimeSep.length == 2) {
          String time = splitOnTimeSep[1];
          try {
            long timeLong = Long.parseLong(time);
            if (timeLong < now - twohours) {
              labOwner.removeClientId(splitOnTimeSep[0]);
              ofy().save().entity(labOwner).now();
              pushDisconnectToChannel(splitOnTimeSep[0]);
            }
          } catch (Exception e) {
            log.info("clean up disconnected labs parsing long: " + e);
          }
        }
      }
    }
  }

  /**
   * 
   * @param clientId The client id to check
   * @return true if clientId is for a lab owner, false if for a device
   */
  public static boolean isClientIdForLabOwner(String clientId) {
    return clientId.contains("user") && clientId.contains("time");
  }

}
