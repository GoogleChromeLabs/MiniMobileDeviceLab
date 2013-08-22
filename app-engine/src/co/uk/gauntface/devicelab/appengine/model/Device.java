package co.uk.gauntface.devicelab.appengine.model;

import java.util.AbstractMap.SimpleEntry;
import java.util.ArrayList;
import java.util.List;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
import javax.jdo.annotations.PersistenceCapable;

@PersistenceCapable
public class Device {
    
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Long id;
    @Persistent
    private String gcmId;
    @Persistent
    private String name;
    @Persistent
    private String nickname;
    @Persistent
    private int platformId;
    @Persistent
    private String platformVersion;
    
    public Device(String gcmId, String name, String nickname, int platformId, String platformVersion) {
        this(null, gcmId, name, nickname, platformId, platformVersion);
    }
    
    public Device(Long deviceId, String gcmId, String name, String nickname, int platformId, String platformVersion) {
        this.id = deviceId;
        this.gcmId = gcmId;
        this.name = name;
        this.nickname = nickname;
        this.platformId = platformId;
        this.platformVersion = platformVersion;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String n) {
        name = n;
    }
    
    public String getGcmId() {
        return gcmId;
    }
    
    public void setGcmId(String id) {
        gcmId = id;
    }
    
    public String getNickname() {
        return nickname;
    }
    
    public void setNickname(String n) {
        nickname = n;
    }
    
    public int getPlatformId() {
        return platformId;
    }
    
    public void setPlatformId(int id) {
        platformId = id;
    }
    
    public String getPlatformVersion() {
        return platformVersion;
    }
    
    public void setPlatformVersion(String v) {
        platformVersion = v;
    }
    
    public Long getDeviceId() {
        return id;
    }
    
    public String getJsonString() {
        List<SimpleEntry<String, String>> values = new ArrayList<SimpleEntry<String, String>>();
        values.add(new SimpleEntry<String, String>("id", Long.toString(getDeviceId())));
        values.add(new SimpleEntry<String, String>("name", getName()));
        values.add(new SimpleEntry<String, String>("gcmId", getGcmId()));
        values.add(new SimpleEntry<String, String>("nickname", getNickname()));
        values.add(new SimpleEntry<String, String>("platformId", Integer.toString(getPlatformId())));
        values.add(new SimpleEntry<String, String>("platformVersion", getName()));
        
        String json = "{";
        
        for(int i = 0; i < values.size(); i++) {
            SimpleEntry<String, String> simple = values.get(i);
            json += "\""+simple.getKey()+"\":\""+simple.getValue()+"\"";
            if(i+1 < values.size()) {
                json += ",";
            }
        }
        
        json += "}";
        
        return json;
    }
}
