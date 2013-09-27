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

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

public class DevicesModel {
    
    private DatastoreService mDatastore;
    
    public DevicesModel() {
        mDatastore = DatastoreServiceFactory.getDatastoreService();
    }
    
    public Device getDevice(Long deviceId) {
        PersistenceManager pm = PMF.get().getPersistenceManager();
        
        Query devicesQuery = pm.newQuery(Device.class);
        devicesQuery.setFilter("id == deviceIdParam");
        devicesQuery.declareParameters("Long deviceIdParam");
        
        List<Device> results = (List<Device>) devicesQuery.execute(deviceId);
        if(results.size() == 0) {
            return null;
        }
        return results.get(0);
    }
}
