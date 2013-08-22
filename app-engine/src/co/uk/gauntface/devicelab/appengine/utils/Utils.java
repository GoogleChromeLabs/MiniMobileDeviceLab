package co.uk.gauntface.devicelab.appengine.utils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Utils {

    public static String getPostParameter(String key, HttpServletRequest request) {
        return request.getParameter(key);
    }
    
}
