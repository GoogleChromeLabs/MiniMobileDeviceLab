package co.uk.gauntface.devicelab.appengine.model;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.PreparedQuery;

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
