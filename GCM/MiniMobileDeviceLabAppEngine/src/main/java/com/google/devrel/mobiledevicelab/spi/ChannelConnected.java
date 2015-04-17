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
import com.google.devrel.mobiledevicelab.spi.helper.ConnectionChannelApiHelper;

public class ChannelConnected extends HttpServlet {

  private static final Logger log = Logger.getLogger(ChannelConnected.class.getName());


  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    log.info("Connected!");
    ChannelService channelService = ChannelServiceFactory.getChannelService();
    ChannelPresence presence = channelService.parsePresence(req);
    String clientId = presence.clientId();
    log.info("Client Id " + clientId);


    if (!ConnectionChannelApiHelper.isClientIdForLabOwner(clientId)) {
      List<Device> devices =
          ofy().load().type(Device.class).filter("browserClientId", clientId).list();
      if (devices.size() == 0) {
        ConnectionChannelApiHelper.pushDisconnectToChannel(clientId);
      } else {
        devices.get(0).browserConnected();
        ofy().save().entity(devices.get(0)).now();
        if (devices.size() > 1) {
          List<Device> devicesToDelete = devices.subList(1, devices.size());
          for (Device device : devicesToDelete) {
            ofy().delete().entity(device);
          }
        }
      }
    }
  }

}
