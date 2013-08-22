
package co.uk.gauntface.devicelab.appengine;

import co.uk.gauntface.devicelab.appengine.controller.DeviceUserController;
import co.uk.gauntface.devicelab.appengine.controller.DevicesController;
import co.uk.gauntface.devicelab.appengine.model.Device;
import co.uk.gauntface.devicelab.appengine.model.DeviceUserPair;
import co.uk.gauntface.devicelab.appengine.utils.GPlusTokenInfo;
import co.uk.gauntface.devicelab.appengine.utils.Utils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.*;

@SuppressWarnings("serial")
public class DevicesServlet extends HttpServlet {
    
    private DevicesController mDevicesController;
    private DeviceUserController mDeviceUserController;
    
    public DevicesServlet() {
        mDevicesController = new DevicesController();
        mDeviceUserController = new DeviceUserController();
    }
    
    public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        System.out.println("DevicesServlet: doPost() req.getRequestURI() = "+req.getRequestURI());
        String requestUri = req.getRequestURI();
        
        String[] uriParts = requestUri.split("/");
        
        if(uriParts.length < 4) {
            // TODO return relevant error message and http status code
            System.out.println("The URI parts length is less that 3 => "+uriParts.length);
            return;
        }
        
        String action = uriParts[3];
        if(action.equals("get")) {
            handleGetEndpoint(req, resp);
        } else if(action.equals("register")) {
            handleRegisterEndpoint(req, resp);
        }
    }
    
    public void  handleGetEndpoint(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        System.out.println("DevicesServlet: handleGetEndpoint()");
        String idToken = Utils.getPostParameter("id_token", req);
        String userId = GPlusTokenInfo.getUserId(idToken);
        List<Device> devices = new ArrayList<Device>();
        if(userId != null) {
            System.out.println("DevicesServlet: UserId = "+userId);
            List<DeviceUserPair> devicePairs = mDeviceUserController.getDeviceIds(userId);
            devices = mDevicesController.getDevices(devicePairs);
        } else {
            System.out.println("DevicesServlet: No UserId Set");
        }
        
        String jsonResponse = "{\"devices\": [";
        for(int i = 0; i < devices.size(); i++) {
            jsonResponse += devices.get(i).getJsonString();
            if(i+1 < devices.size()) {
                jsonResponse += ", ";
            }
        }
        jsonResponse += "]}";
        
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.setContentType("application/json");
        resp.getWriter().println(jsonResponse);
    }
    
    public void handleRegisterEndpoint(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String idToken = Utils.getPostParameter("id_token", req);
        String deviceIdString = Utils.getPostParameter("device_id", req);
        Long deviceId = null;
        if(deviceIdString != null) {
            deviceId = Long.valueOf(deviceIdString);
        }
        String gcmId = Utils.getPostParameter("gcm_id", req);
        String deviceName = Utils.getPostParameter("device_name", req);
        String deviceNickname = Utils.getPostParameter("device_nickname", req);
        int platformId = Integer.parseInt(Utils.getPostParameter("platform_id", req));
        String platformVersion = Utils.getPostParameter("platform_version", req);
        
        String userId = GPlusTokenInfo.getUserId(idToken);
        
        //System.out.println("DevicesServlet: deviceId = "+deviceId);
        //System.out.println("DevicesServlet: deviceName = "+deviceName);
        //System.out.println("DevicesServlet: deviceNickName = "+deviceNickname);
        //System.out.println("DevicesServlet: platformId = "+platformId);
        //System.out.println("DevicesServlet: platformVersion = "+platformVersion);
        //System.out.println("DevicesServlet: userId = "+userId);
        System.out.println("DevicesServlet: gcmId = "+gcmId);
        
        Device device = new Device(deviceId, gcmId, deviceName, deviceNickname, platformId, platformVersion);
        deviceId = mDevicesController.registerDevice(device); 
        if(deviceId != null) {
            mDeviceUserController.registerUserDeviceParing(new DeviceUserPair(userId, deviceId));
        } else {
            // TODO Throw Error
        }
        
        String jsonResponse = "{";
        jsonResponse += "\"device_id\": "+Long.toString(deviceId);
        jsonResponse += "}";
        
        resp.addHeader("Access-Control-Allow-Origin", "*");
        resp.setContentType("application/json");
        resp.getWriter().println(jsonResponse);
    }
}
