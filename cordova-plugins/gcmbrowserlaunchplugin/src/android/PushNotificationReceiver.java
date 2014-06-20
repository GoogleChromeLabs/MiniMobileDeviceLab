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

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Browser;
import android.util.Log;
import android.content.SharedPreferences;

import co.uk.gauntface.cordova.plugin.gcmbrowserlaunch.C;

import com.google.android.gms.gcm.GoogleCloudMessaging;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class PushNotificationReceiver extends BroadcastReceiver {

    private static final String PREFS_NAME = "DEVICE_LAB_PREFS";

    public PushNotificationReceiver() {

    }

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.v(C.TAG, "PushNotificationReceiver: Received Notification");

        GoogleCloudMessaging gcm = GoogleCloudMessaging.getInstance(context);
        String messageType = gcm.getMessageType(intent);

        if (GoogleCloudMessaging.MESSAGE_TYPE_SEND_ERROR.equals(messageType)) {
            //sendNotification("Send error: " + intent.getExtras().toString());
            Log.e(C.TAG, "PushNotificationReceiver: MESSAGE_TYPE_SEND_ERROR");
        } else if (GoogleCloudMessaging.MESSAGE_TYPE_DELETED.equals(messageType)) {
            Log.e(C.TAG, "PushNotificationReceiver: MESSAGE_TYPE_DELETED");
        } else {
            Bundle data = intent.getExtras();
            if(data != null) {
                String url = validateUrl(data.getString("url"));
                String packageName = data.getString("pkg");
                String session = data.getString("session");

                SharedPreferences settings = context.getSharedPreferences(PREFS_NAME, 0);
                String lastSession = settings.getString("lastsession", null);
                String lastReceivedUrl = settings.getString("lastreceivedurl", null);
                
                if(session != null && 
                    session.equals(lastSession) && 
                    url.equals(lastReceivedUrl)) {
                    setResultCode(Activity.RESULT_OK);
                    return;
                }

                //Log.v(C.TAG, "PushNotificationReceiver: url = "+url);
                //Log.v(C.TAG, "PushNotificationReceiver: lastsession = "+lastSession);
                //Log.v(C.TAG, "PushNotificationReceiver: lastReceivedUrl = "+lastReceivedUrl);
                
                if(url != null) {
                    launchBrowserTask(context, url, packageName);

                    // We need an Editor object to make preference changes.
                    // All objects are from android.context.Context
                    SharedPreferences.Editor editor = settings.edit();
                    editor.putString("lastreceivedurl", url);
                    editor.putString("lastsession", session);

                    // Commit the edits!
                    editor.commit();
                }

            }
        }

        setResultCode(Activity.RESULT_OK);
    }

    private String validateUrl(String url) {
        if(url == null) {
            return null;
        }

        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }

        return "http://" + url;
    }

    private void launchBrowserTask(Context context, String url, String packageName) {
        Log.v(C.TAG, "launchBrowserTask");
        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        browserIntent.setPackage(packageName);
        browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        List<ResolveInfo> activitiesList = context.getPackageManager().queryIntentActivities(
                browserIntent, -1);
        if(activitiesList.size() > 0) {
            browserIntent.putExtra(Browser.EXTRA_APPLICATION_ID, context.getPackageName());
            context.startActivity(browserIntent);
        } else {
            Intent playStoreIntent = new Intent(Intent.ACTION_VIEW);
            playStoreIntent.setData(Uri.parse("market://details?id="+packageName));
            playStoreIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(playStoreIntent);
            /**Intent rawIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            rawIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(rawIntent);**/
        }
    }
}
