package com.google.devrel.mobiledevicelab.spi;

import static com.google.devrel.mobiledevicelab.service.OfyService.ofy;

import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.channel.ChannelPresence;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.google.devrel.mobiledevicelab.domain.Device;
import com.google.devrel.mobiledevicelab.domain.LabOwner;
import com.google.devrel.mobiledevicelab.spi.helper.ConnectionChannelApiHelper;
import com.googlecode.objectify.Key;

public class ChannelDisconnected extends HttpServlet {

  private static final Logger log = Logger.getLogger(ChannelDisconnected.class.getName());

  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    log.info("Disconnected!");
    ChannelService channelService = ChannelServiceFactory.getChannelService();
    ChannelPresence presence = channelService.parsePresence(req);
    String clientId = presence.clientId();
    ofy().clear();

    if (!ConnectionChannelApiHelper.isClientIdForLabOwner(clientId)) {
      List<Device> devices =
          ofy().load().type(Device.class).filter("browserClientId", clientId).list();
      for (Device device : devices) {
        ofy().delete().entity(device);
        ofy().clear();
        LabOwner labOwner =
            ofy().cache(false).load().type(LabOwner.class).filter("groupId", device.getGroupId())
                .list()
                .get(0);
        ConnectionChannelApiHelper.pushUpdateDevicesToChannel(labOwner);
      }
    } else {
      String userId = clientId.substring(4).split("time")[0];
      log.info("userId " + userId);
      LabOwner labOwner =
          ofy().load().key(Key.create(LabOwner.class, userId)).now();
      if (labOwner != null) {
        labOwner.removeClientId(clientId);
        ofy().save().entity(labOwner).now();
      }
    }
  }

}
