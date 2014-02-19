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
package co.uk.gauntface.mobile.devicelab.receiver;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import co.uk.gauntface.mobile.devicelab.C;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class PushNotificationReceiver extends BroadcastReceiver {

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
                String dataString = data.getString("data");
                Log.v(C.TAG, "PushNotificationReceiver: dataString = "+dataString);
                try {
                    JSONObject dataObject = new JSONObject(dataString);
                    String url = validateUrl(dataObject.optString("url"));
                    String packageName = dataObject.optString("pkg");
                    if(url != null) {
                        launchBrowserTask(context, url, packageName);
                    }
                } catch (JSONException e) {
                    Log.e(C.TAG, "PushNotificationReceiver: JSONException ", e);
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
        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        browserIntent.setPackage(packageName);
        browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        List<ResolveInfo> activitiesList = context.getPackageManager().queryIntentActivities(
                browserIntent, -1);
        if(activitiesList.size() > 0) {
            context.startActivity(browserIntent);
        } else {
            Intent playStoreIntent = new Intent(Intent.ACTION_VIEW);
            playStoreIntent.setData(Uri.parse("market://details?id="+packageName));
            playStoreIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(playStoreIntent);
        }
    }
}
