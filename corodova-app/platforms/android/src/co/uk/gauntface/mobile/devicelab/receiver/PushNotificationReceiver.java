package co.uk.gauntface.mobile.devicelab.receiver;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

import co.uk.gauntface.mobile.devicelab.C;

/**
 * Created by mattgaunt on 12/07/2013.
 */
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
