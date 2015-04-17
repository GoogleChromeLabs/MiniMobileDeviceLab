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

import java.util.logging.Logger;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

/**
 * Device class stores device information.
 */
@Entity
public class Url {

  private static final Logger log = Logger.getLogger(LabOwner.class.getName());


  /**
   * The id for the datastore key. We use automatic id assignment for entities
   * of Url class.
   */
  @Id private Long id;

  /**
   * The url
   */
  @Index private String url;

  /**
   * When the url was last pushed to a device
   */
  @Index private long lastUsed;

  /**
   * The id of the group linked to the url
   */
  @Index private int groupId;

  /**
   * ClientIds for the lab owner, one for each active browser window; Channel
   * API is used to automatically refresh list of devices
   * 
   * A concatenated list as follows:
   * clientid1:time1;clientid2:time2;clientid3:time3
   * 
   */
  private String clientIds;

  /**
   * Client ids separator
   */
  private final static String CLIENT_ID_SEP = ";";

  /**
   * Time for client id separator
   */
  public final static String TIME_SEP = ":";


  /**
   * Just making the default constructor private.
   */
  private Url() {
  }

  /**
   * Public constructor for Url.
   * 
   * @param url The url
   * @param groupId The id of the group linked to the url
   */
  public Url(String url, int groupId) {
    this.url = url;
    this.lastUsed = System.currentTimeMillis();
    this.groupId = groupId;
  }

  public Long getId() {
    return id;
  }

  public String getUrl() {
    return url;
  }

  public void urlPushed() {
    this.lastUsed = System.currentTimeMillis();
  }

  public String getClientIdsStr() {
    return clientIds;
  }

  public String[] getClientIdsWithTime() {
    if (clientIds == null || clientIds.equals("")) {
      return null;
    } else {
      return clientIds.split(CLIENT_ID_SEP);
    }
  }

  public boolean containsClientId(String clientId) {
    return clientIds != null && clientIds.contains(clientId);
  }

  public void addClientId(String clientId) {
    if (clientIds == null) {
      clientIds = "";
    }
    if (clientIds.equals("")) {
      clientIds = clientId + TIME_SEP + System.currentTimeMillis();
    } else {
      clientIds += CLIENT_ID_SEP + clientId + TIME_SEP + System.currentTimeMillis();
    }
  }

  public void removeClientId(String clientId) {
    if (clientIds == null || clientIds.equals("")) {
      return;
    } else {
      String regEx = "(" + clientId + TIME_SEP + ")[0-9]+";
      clientIds = clientIds.replaceAll(regEx + "(" + CLIENT_ID_SEP + ")", "");
      clientIds = clientIds.replaceAll("(" + CLIENT_ID_SEP + ")" + regEx, "");
      clientIds = clientIds.replaceAll(regEx, "");
    }
  }


}
