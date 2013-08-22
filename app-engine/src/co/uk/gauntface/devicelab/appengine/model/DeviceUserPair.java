package co.uk.gauntface.devicelab.appengine.model;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable
public class DeviceUserPair {
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Long id;
    @Persistent
    private String userId;
    @Persistent
    private Long deviceId;
    
    public DeviceUserPair(String uId, Long dId) {
        userId = uId;
        deviceId = dId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public Long getPairId() {
        return id;
    }
    
    public Long getDeviceId() {
        return deviceId;
    }
}
