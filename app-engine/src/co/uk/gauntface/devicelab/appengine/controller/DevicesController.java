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

import java.util.ArrayList;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Transaction;

import co.uk.gauntface.devicelab.appengine.model.Device;
import co.uk.gauntface.devicelab.appengine.model.DeviceUserModel;
import co.uk.gauntface.devicelab.appengine.model.DeviceUserPair;
import co.uk.gauntface.devicelab.appengine.model.DevicesModel;
import co.uk.gauntface.devicelab.appengine.model.PMF;

public class DevicesController {

    private DevicesModel mDevicesModel;
    private DeviceUserModel mDeviceUserModel;
    
    public DevicesController() {
        mDevicesModel = new DevicesModel();
        mDeviceUserModel = new DeviceUserModel();
    }
    
    public List<Device> getDevices(List<DeviceUserPair> devicePairs) {
        List<Device> deviceList = new ArrayList<Device>();
        Device device;
        for(int i = 0; i < devicePairs.size(); i++) {
            device = mDevicesModel.getDevice(devicePairs.get(i).getDeviceId());
            if(device != null) {
                deviceList.add(device);
            }
        }
        
        return deviceList;
    }
    
    public List<Device> getDevices(String userId, List<Long> deviceIds) {
        List<Device> deviceList = new ArrayList<Device>();
        Device device;
        Long deviceId;
        boolean isMatch;
        for(int i = 0; i < deviceIds.size(); i++) {
            deviceId = deviceIds.get(i);
            isMatch = mDeviceUserModel.matchUserDevice(userId, deviceId);
            if(isMatch) {
                device = mDevicesModel.getDevice(deviceId);
                if(device != null) {
                    deviceList.add(device);
                }
            }
        }
        
        return deviceList;
    }
    
    public Long registerDevice(Device device) {        
        Long deviceId = null;
        PersistenceManager pm = PMF.get().getPersistenceManager();
        Transaction trans = pm.currentTransaction();
        try{ 
          Device existingDevice = null;
          
          if(device.getDeviceId() != null) {
              existingDevice = mDeviceUserModel.getDeviceWithId(device.getDeviceId());
              System.out.println("DevicesControler: existingDevice IS NULL = "+(existingDevice == null));
          }
           
          if(existingDevice == null) {
              // Last ditch attempt in case the device ID was dropped from localstorage on the device
              existingDevice = mDeviceUserModel.getDeviceWithGCMId(device.getGcmId());
          }
          
          if(existingDevice != null) {
              System.out.println("DevicesControler: UPDATING gcmId = "+existingDevice.getGcmId());
              trans.begin();
              deviceId = existingDevice.getDeviceId();
              existingDevice.setName(device.getName());
              existingDevice.setNickname(device.getNickname());
              existingDevice.setPlatformId(device.getPlatformId());
              existingDevice.setPlatformVersion(device.getPlatformVersion());
              existingDevice.setGcmId(device.getGcmId());
              trans.commit();
          } else {
              pm.makePersistent(device);
              deviceId = device.getDeviceId();
          }
        }finally{
          pm.close();
        }
        
        return deviceId;
    }
    
}
