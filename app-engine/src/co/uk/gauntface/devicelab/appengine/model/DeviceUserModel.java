/**
 * Copyright 2013 Google Inc. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package co.uk.gauntface.devicelab.appengine.model;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

public class DeviceUserModel {
    
    private DatastoreService mDatastore;
    
    public DeviceUserModel() {
        mDatastore = DatastoreServiceFactory.getDatastoreService();
    }
    
    public List<Device> getDevices(String userId) {
        PersistenceManager pm = PMF.get().getPersistenceManager();
        
        Query devicesQuery = pm.newQuery(Device.class);
        devicesQuery.setFilter("userId == userIdParam");
        devicesQuery.declareParameters("String userIdParam");
        
        List<Device> results = (List<Device>) devicesQuery.execute(userId);
        
        return results;
    }
    
    public List<DeviceUserPair> getDeviceIds(String userId) {
        List<DeviceUserPair> deviceIds = new ArrayList<DeviceUserPair>();
        
        PersistenceManager pm = PMF.get().getPersistenceManager();
        
        Query deviceUserQuery = pm.newQuery(DeviceUserPair.class);
        deviceUserQuery.setFilter("userId == userIdParam");
        deviceUserQuery.declareParameters("String userIdParam");
        
        List<DeviceUserPair> results = (List<DeviceUserPair>) deviceUserQuery.execute(userId);
        for(int i = 0; i < results.size(); i++) {
            deviceIds.add(results.get(i));
        }
        
        return deviceIds;
    }
    
    public boolean matchUserDevice(String userId, Long deviceId) {
        PersistenceManager pm = PMF.get().getPersistenceManager();
        
        Query devicesQuery = pm.newQuery(DeviceUserPair.class);
        devicesQuery.setFilter("userId == userIdParam && deviceId == deviceIdParam");
        devicesQuery.declareParameters("String userIdParam, Long deviceIdParam");
        
        List<Device> results = (List<Device>) devicesQuery.execute(userId, deviceId);
        
        return (results.size() > 0);
    }
    
    public Device getDeviceWithId(Long deviceId) {
        PersistenceManager pm = PMF.get().getPersistenceManager();
        
        Query deviceUserQuery = pm.newQuery(Device.class);
        deviceUserQuery.setFilter("id == deviceIdParam");
        deviceUserQuery.declareParameters("Long deviceIdParam");
        
        List<Device> results = (List<Device>) deviceUserQuery.execute(deviceId);
        if(results.size() == 0) {
            return null;
        }
        
        return results.get(0);
    }
    
    public Device getDeviceWithGCMId(String gcmId) {
        PersistenceManager pm = PMF.get().getPersistenceManager();
        
        Query deviceUserQuery = pm.newQuery(Device.class);
        deviceUserQuery.setFilter("gcmId == gcmIdParam");
        deviceUserQuery.declareParameters("String gcmIdParam");
        
        List<Device> results = (List<Device>) deviceUserQuery.execute(gcmId);
        if(results.size() == 0) {
            return null;
        }
        
        return results.get(0);
    }
    
}
