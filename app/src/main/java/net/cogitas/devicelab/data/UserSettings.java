/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 **/
package net.cogitas.devicelab.data;

import android.content.Context;
import android.content.SharedPreferences;

import net.cogitas.devicelab.enums.GAEIdVerificationStatus;

/**
 * This class reads and stores user settings
 */
public class UserSettings {

    private static final String SHARED_PREFS_NAME = "user_settings";

    private static final String APP_ENGINE_ID = "app_engine_id";

    private static final String APP_ENGINE_NUMBER = "app_engine_number";

    private static final String DEVICE_SERVER_ID = "device_server_id";

    private static final String DEVICE_GPLUS_TOKEN = "device_gplus_token";

    private static final String GCM_REGISTRATION_TOKEN = "gcm_registration_token";

    private static final String APP_ENGINE_ID_VERIFICATION_STATUS
            = "app_engine_id_verification_status";

    private static final String LOGIN_FAILURE_REASON = "login_failure_reason";

    public static boolean isDeviceAddedToLab(Context context) {
        return !getDeviceServerId(context).equals("");
    }

    public static GAEIdVerificationStatus getAppEngineIdStatus(Context context) {
        return GAEIdVerificationStatus.getFromId(
                context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
                        .getInt(APP_ENGINE_ID_VERIFICATION_STATUS,
                                GAEIdVerificationStatus.NOT_VERIFIED.getId()));
    }

    public static void setAppEngineIdVerificationStatus(Context context,
            GAEIdVerificationStatus status) {
        SharedPreferences.Editor editor = context
                .getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putInt(APP_ENGINE_ID_VERIFICATION_STATUS, status.getId());
        editor.commit();
    }

    public static String getAppEngineId(Context context) {
        return context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
                .getString(APP_ENGINE_ID, "");
    }

    public static void setAppEngineId(Context context, String appEngineId) {
        SharedPreferences.Editor editor = context
                .getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putString(APP_ENGINE_ID, appEngineId);
        editor.commit();
    }

    public static String getAppEngineNumber(Context context) {
        return context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
                .getString(APP_ENGINE_NUMBER, "");
    }

    public static void setAppEngineNumber(Context context, String appEngineNumber) {
        SharedPreferences.Editor editor = context
                .getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putString(APP_ENGINE_NUMBER, appEngineNumber);
        editor.commit();
    }


    public static String getDeviceGplusToken(Context context) {
        return context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
                .getString(DEVICE_GPLUS_TOKEN, "");
    }

    public static void setDeviceGplusToken(Context context, String deviceGplusToken) {
        SharedPreferences.Editor editor = context
                .getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putString(DEVICE_GPLUS_TOKEN, deviceGplusToken);
        editor.commit();
    }

    public static String getDeviceServerId(Context context) {
        return context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
                .getString(DEVICE_SERVER_ID, "");
    }

    public static void setDeviceServerId(Context context, String deviceServerId) {
        SharedPreferences.Editor editor = context
                .getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putString(DEVICE_SERVER_ID, deviceServerId);
        editor.commit();
    }

    public static String getGcmRegistrationToken(Context context) {
        return context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
                .getString(GCM_REGISTRATION_TOKEN, "");
    }

    public static void setGcmRegistrationToken(Context context, String gcmToken) {
        SharedPreferences.Editor editor = context
                .getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putString(GCM_REGISTRATION_TOKEN, gcmToken);
        editor.commit();
    }


    public static String getLoginFailureReason(Context context) {
        return context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)
                .getString(LOGIN_FAILURE_REASON, "");
    }

    public static void setLoginFailureReason(Context context, String reason) {
        SharedPreferences.Editor editor = context
                .getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE).edit();
        editor.putString(LOGIN_FAILURE_REASON, reason);
        editor.commit();
    }


}
