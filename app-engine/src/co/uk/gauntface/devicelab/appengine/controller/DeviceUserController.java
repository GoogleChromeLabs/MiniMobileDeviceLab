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
