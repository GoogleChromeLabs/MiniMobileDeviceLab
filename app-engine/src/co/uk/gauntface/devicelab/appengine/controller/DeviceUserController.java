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
package co.uk.gauntface.devicelab.appengine.controller;

import java.util.List;

import javax.jdo.PersistenceManager;

import co.uk.gauntface.devicelab.appengine.model.Device;
import co.uk.gauntface.devicelab.appengine.model.DeviceUserModel;
import co.uk.gauntface.devicelab.appengine.model.DeviceUserPair;
import co.uk.gauntface.devicelab.appengine.model.DevicesModel;
import co.uk.gauntface.devicelab.appengine.model.PMF;

public class DeviceUserController {

    private DeviceUserModel mDeviceUserModel;
    
    public DeviceUserController() {
        mDeviceUserModel = new DeviceUserModel();
    }
    
    
    
    public void registerUserDeviceParing(DeviceUserPair deviceUserPair) {
        if(mDeviceUserModel.matchUserDevice(deviceUserPair.getUserId(), deviceUserPair.getDeviceId())) {
            return;
        }
        
        PersistenceManager pm = PMF.get().getPersistenceManager();
        
        Long deviceUserId = null;
        try {
            pm.makePersistent(deviceUserPair);
            deviceUserId = deviceUserPair.getPairId();
        } finally {
            pm.close();
        }
    }
    
    public List<DeviceUserPair> getDeviceIds(String userId) {
        List<DeviceUserPair> deviceIdList = mDeviceUserModel.getDeviceIds(userId);
        return deviceIdList;
    }
}
