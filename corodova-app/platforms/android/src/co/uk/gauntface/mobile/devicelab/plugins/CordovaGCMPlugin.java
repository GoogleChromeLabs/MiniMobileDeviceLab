package co.uk.gauntface.mobile.devicelab.plugins;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import co.uk.gauntface.mobile.devicelab.C;
import co.uk.gauntface.mobile.devicelab.controller.GCMController;

/**
 * Created by mattgaunt on 08/07/2013.
 */
public class CordovaGCMPlugin extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
        GCMController gcmController = new GCMController(this.cordova.getActivity().getApplicationContext());
        if(action.equals("getRegId")) {
            gcmController.getRegistrationId(new GCMController.GCMControllerListener() {
                @Override
                public void onRegistrationIdReceived(String regId) {
                    Log.v(C.TAG, "CordovaGCMPlugin: onRegistrationIdReceived() Registration = "+regId);
                    if(regId != null && regId.length() > 0) {
                        JSONObject jsonObj = new JSONObject();
                        try {
                            jsonObj.put("regId", regId);
                            callbackContext.success(jsonObj);
                            return;
                        } catch (JSONException e) {
                            Log.e(C.TAG, "CordovaGCMPlugin: regId = "+regId, e);
                        }
                    }

                    callbackContext.error(-1);
                }
            });
            return true;
        }

        return false;
    }
}
