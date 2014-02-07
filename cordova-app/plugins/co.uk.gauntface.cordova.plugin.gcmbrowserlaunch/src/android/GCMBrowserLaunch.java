/**
 Copyright 2013 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 **/
package co.uk.gauntface.cordova.plugin.gcmbrowserlaunch;

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

import co.uk.gauntface.cordova.plugin.gcmbrowserlaunch.C;
import co.uk.gauntface.cordova.plugin.gcmbrowserlaunch.GCMController;

public class GCMBrowserLaunch extends CordovaPlugin {

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
