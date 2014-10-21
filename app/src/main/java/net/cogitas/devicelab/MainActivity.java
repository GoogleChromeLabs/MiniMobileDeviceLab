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
package net.cogitas.devicelab;

import android.app.Activity;
import android.app.DialogFragment;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.google.android.gms.auth.GoogleAuthException;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.plus.Plus;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URISyntaxException;

import net.cogitas.devicelab.data.UserSettings;
import net.cogitas.devicelab.enums.GAEIdVerificationStatus;
import net.cogitas.devicelab.io.HttpCallHelper;


public class MainActivity extends Activity
        implements GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener,
        SetGAEIdDialogFragment.SetGAEIdDialogListener {

    //TODO - review code

    /* Track whether the sign-in button has been clicked so that we know to resolve
    * all issues preventing sign-in without waiting.
    */
    private boolean mSignInClicked;

    /* Store the connection result from onConnectionFailed callbacks so that we can
     * resolve them when the user clicks sign-in.
     */
    private ConnectionResult mConnectionResult;

    /* Request code used to invoke sign in user interactions. */
    private static final int RC_SIGN_IN = 0;

    /* Client used to interact with Google APIs. */
    private GoogleApiClient mGoogleApiClient;

    /* A flag indicating that a PendingIntent is in progress and prevents
     * us from starting further intents.
     */
    private boolean mIntentInProgress;

    /**
     * The progress bar used to show progress of logging in
     */
    private ProgressBar mLoginProgressBar;

    /**
     * The text near the progress bar used to update user of progress of logging in
     */
    private TextView mLoginStatus;

    /**
     * The progress bar used to show progress of logging out
     */
    private ProgressBar mLogoutProgressBar;

    /**
     * The text near the progress bar used to update user of progress of logging out
     */
    private TextView mLogoutStatus;


    private final static String TAG = MainActivity.class.getName();

    private final static int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;

    private GoogleCloudMessaging mGcm;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_act);
        initGoogleServices();
        initUI();
    }

    private void initGoogleServices() {
        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .addApi(Plus.API)
                .addScope(Plus.SCOPE_PLUS_LOGIN)
                .build();
    }

    private void initUI() {
        findViewById(R.id.signInButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!mGoogleApiClient.isConnecting()) {
                    mSignInClicked = true;
                    resolveSignInError();
                }
            }
        });
        findViewById(R.id.signOutButton).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                logOut();
            }
        });
        findViewById(R.id.gaeLL).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                displayGAEUrlDialog();
            }
        });
        findViewById(R.id.gaeNumberLL).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                displayGAEUrlDialog();
            }
        });
        mLoginProgressBar = (ProgressBar) findViewById(R.id.loginVerificationProgress);
        mLoginStatus = (TextView) findViewById(R.id.loginVerificationStatus);
        mLogoutProgressBar = (ProgressBar) findViewById(R.id.logoutVerificationProgress);
        mLogoutStatus = (TextView) findViewById(R.id.logoutVerificationStatus);
    }

    private void logOut() {
        new RemoveDeviceFromLab(this).execute();
    }


    private void refreshUI() {
        mLoginProgressBar.setVisibility(View.GONE);
        mLoginStatus.setVisibility(View.GONE);
        mLogoutProgressBar.setVisibility(View.GONE);
        mLogoutStatus.setVisibility(View.GONE);

        LinearLayout loggedOut = (LinearLayout) findViewById(R.id.loggedOut);
        LinearLayout loggedIn = (LinearLayout) findViewById(R.id.loggedIn);
        if (UserSettings.isDeviceAddedToLab(this)) {
            loggedIn.setVisibility(View.VISIBLE);
            loggedOut.setVisibility(View.GONE);

        } else {
            loggedIn.setVisibility(View.GONE);
            loggedOut.setVisibility(View.VISIBLE);

            String appEngineId = UserSettings.getAppEngineId(this);
            LinearLayout gaeVerifyingLL = (LinearLayout) findViewById(R.id.gaeVerificationLL);

            if (appEngineId.equals("")) {
                ((TextView) findViewById(R.id.gaeUrl)).setText(R.string.gae_id_label_hint);
                gaeVerifyingLL.setVisibility(View.GONE);
            } else {
                ((TextView) findViewById(R.id.gaeUrl)).setText(appEngineId);
                gaeVerifyingLL.setVisibility(View.VISIBLE);
                ((TextView) findViewById(R.id.gaeNumber))
                        .setText(UserSettings.getAppEngineNumber(this));

                //Update the UI for the gaeVerification linear layout
                TextView verificationStatus = (TextView) findViewById(R.id.gaeVerificationStatus);
                ProgressBar verificationProgressBar = (ProgressBar) findViewById(
                        R.id.gaeVerificationProgress);
                GAEIdVerificationStatus idStatus = UserSettings.getAppEngineIdStatus(this);
                verificationStatus.setText(idStatus.getDisplayString(this));
                verificationProgressBar
                        .setVisibility(idStatus.showProgressBar() ? View.VISIBLE : View.GONE);

                //We set on click listened to redo verification
                gaeVerifyingLL.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        new GAEIdVerifier(MainActivity.this).execute();
                    }
                });

                //If verification passed, we allow user to log in; otherwise, we block it
                TextView loginDescription = (TextView) findViewById(R.id.loginDescription);
                SignInButton signInButton = (SignInButton) findViewById(R.id.signInButton);
                if (idStatus == GAEIdVerificationStatus.VERIFICATION_PASSED && UserSettings
                        .getAppEngineNumber(this).equals("")) {
                    loginDescription.setText(R.string.description_logged_out4);
                    signInButton.setVisibility(View.GONE);
                } else if (idStatus == GAEIdVerificationStatus.VERIFICATION_PASSED) {
                    loginDescription.setText(R.string.description_logged_out3);
                    signInButton.setVisibility(View.VISIBLE);
                } else {
                    loginDescription.setText(R.string.description_logged_out2);
                    signInButton.setVisibility(View.GONE);
                }

                //Show reason logged in failed
                if (!UserSettings.getLoginFailureReason(this).equals("")
                        && idStatus == GAEIdVerificationStatus.VERIFICATION_PASSED) {
                    mLoginStatus.setVisibility(View.VISIBLE);
                    mLoginStatus.setText(UserSettings.getLoginFailureReason(this));
                }
            }

        }


    }

    private void displayGAEUrlDialog() {
        DialogFragment dialog = new SetGAEIdDialogFragment();
        dialog.show(getFragmentManager(), "SetGAEIdDialogFragment");
    }

    // The dialog fragment receives a reference to this Activity through the
    // Fragment.onAttach() callback, which it uses to call the following methods
    // defined by the NoticeDialogFragment.NoticeDialogListener interface
    @Override
    public void onDialogPositiveClick(DialogFragment dialog) {
        // User touched the dialog's positive button
        EditText idET = (EditText) dialog.getDialog().findViewById(R.id.idET);
        EditText numberET = (EditText) dialog.getDialog().findViewById(R.id.numberET);
        UserSettings.setAppEngineId(this, idET.getText().toString().trim());
        UserSettings.setAppEngineNumber(this, numberET.getText().toString().trim());
        if (!UserSettings.getAppEngineNumber(this).equals("")) {
            registerWithPush();
        }
        if (!UserSettings.getAppEngineId(this).equals("")) {
            new GAEIdVerifier(this).execute();
        }

        refreshUI();

    }

    @Override
    public void onDialogNegativeClick(DialogFragment dialog) {
        // User touched the dialog's negative button, no action required
    }

    @Override
    protected void onStart() {
        super.onStart();
        mGoogleApiClient.connect();
        refreshUI();
    }


    @Override
    protected void onStop() {
        super.onStop();

        if (mGoogleApiClient.isConnected()) {
            mGoogleApiClient.disconnect();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int responseCode, Intent intent) {
        if (requestCode == RC_SIGN_IN) {
            if (responseCode != RESULT_OK) {
                mSignInClicked = false;
            }

            mIntentInProgress = false;

            if (!mGoogleApiClient.isConnecting()) {
                mGoogleApiClient.connect();
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
        return super.onOptionsItemSelected(item);
    }

    /* A helper method to resolve the current ConnectionResult error. */
    private void resolveSignInError() {
        if (mConnectionResult != null && mConnectionResult.hasResolution()) {
            try {
                mIntentInProgress = true;
                startIntentSenderForResult(mConnectionResult.getResolution().getIntentSender(),
                        RC_SIGN_IN, null, 0, 0, 0);
            } catch (IntentSender.SendIntentException e) {
                // The intent was canceled before it was sent.  Return to the default
                // state and attempt to connect to get an updated ConnectionResult.
                mIntentInProgress = false;
                mGoogleApiClient.connect();
            }
        }
    }

    @Override
    public void onConnected(Bundle connectionHint) {
        mSignInClicked = false;
        refreshUI();
        if (UserSettings.getDeviceGplusToken(this).equals("")
                && UserSettings.getAppEngineIdStatus(this)
                == GAEIdVerificationStatus.VERIFICATION_PASSED) {
            new GPlusIDTokenFetcher(this).execute();
        } else if (!UserSettings.getDeviceGplusToken(this).equals("")
                && UserSettings.getAppEngineIdStatus(this)
                == GAEIdVerificationStatus.VERIFICATION_PASSED && UserSettings
                .getDeviceServerId(this).equals("")) {
            new AddDeviceToLab(this).execute();
        } else if (UserSettings.getAppEngineIdStatus(this)
                != GAEIdVerificationStatus.VERIFICATION_PASSED) {
            logOut();
        }


    }

    private void registerWithPush() {
        if (checkPlayServices()) {
            if (mGcm == null) {
                mGcm = GoogleCloudMessaging.getInstance(this);
            }
            new GcmRegistration(this).execute();
        } else {
            Log.e(TAG, "No play services!");
        }
    }


    /**
     * Check the device to make sure it has the Google Play Services APK. If
     * it doesn't, display a dialog that allows users to download the APK from
     * the Google Play Store or enable it in the device's system settings.
     */
    private boolean checkPlayServices() {
        int resultCode = GooglePlayServicesUtil.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (GooglePlayServicesUtil.isUserRecoverableError(resultCode)) {
                GooglePlayServicesUtil.getErrorDialog(resultCode, this,
                        PLAY_SERVICES_RESOLUTION_REQUEST).show();
            } else {
                Log.i(TAG, "This device is not supported.");
            }
            return false;
        }
        return true;
    }

    @Override
    public void onConnectionSuspended(int cause) {
        refreshUI();
        mGoogleApiClient.connect();
    }

    public void onConnectionFailed(ConnectionResult result) {
        refreshUI();
        if (!mIntentInProgress) {
            // Store the ConnectionResult so that we can use it later when the user clicks
            // 'sign-in'.
            mConnectionResult = result;

            if (mSignInClicked) {
                // The user has already clicked 'sign-in' so we attempt to resolve all
                // errors until the user is signed in, or they cancel.
                resolveSignInError();
            }
        }
    }


    private class GPlusIDTokenFetcher extends AsyncTask<String, Void, String> {

        Context context;

        public GPlusIDTokenFetcher(Context context) {
            this.context = context;
        }

        @Override
        protected void onPreExecute() {
            mLoginProgressBar.setVisibility(View.VISIBLE);
            mLoginStatus.setVisibility(View.VISIBLE);
            mLoginStatus.setText(R.string.login_verifying);
            UserSettings.setLoginFailureReason(context, "");
        }

        @Override
        protected String doInBackground(String... params) {
            return getGPlusIDToken(context);
        }

        @Override
        protected void onPostExecute(String result) {
            if (result != null && !result.equals("")) {
                UserSettings.setDeviceGplusToken(context, result);
                if (!UserSettings.getGcmRegistrationToken(context).equals("")) {
                    new AddDeviceToLab(context).execute();
                } else {
                    mLoginProgressBar.setVisibility(View.GONE);
                    UserSettings.setLoginFailureReason(context,
                            getResources().getString(R.string.login_verifying_failed) + " "
                                    + getResources()
                                    .getString(R.string.login_verifying_failed_push));
                    refreshUI();
                }
            } else {
                UserSettings.setDeviceGplusToken(context, "");
                mLoginProgressBar.setVisibility(View.GONE);
                UserSettings.setLoginFailureReason(context,
                        getResources().getString(R.string.login_verifying_failed) + " "
                                + getResources().getString(R.string.login_verifying_failed_gplus));
                refreshUI();
            }
        }
    }

    /**
     * Only call this from a ASync Task!!!
     */
    private String getGPlusIDToken(Context context) {
        String scope = "oauth2:https://www.googleapis.com/auth/plus.me";
        String token = null;
        try {
            token = GoogleAuthUtil
                    .getToken(context, Plus.AccountApi.getAccountName(mGoogleApiClient), scope);
            Log.d(TAG, "G+ Token: " + token);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (GoogleAuthException e) {
            e.printStackTrace();
        }
        return token;
    }


    private class AddDeviceToLab extends AsyncTask<String, Void, String> {

        Context context;

        public AddDeviceToLab(Context context) {
            this.context = context;
        }

        @Override
        protected void onPreExecute() {
            mLoginProgressBar.setVisibility(View.VISIBLE);
            mLoginStatus.setVisibility(View.VISIBLE);
            mLoginStatus.setText(R.string.login_verifying);
            UserSettings.setLoginFailureReason(context, "");
        }

        @Override
        protected String doInBackground(String... params) {
            try {
                JSONObject data = new JSONObject();
                data.put("token", UserSettings.getDeviceGplusToken(context));
                data.put("userId", Plus.PeopleApi.getCurrentPerson(mGoogleApiClient).getId());
                data.put("deviceName", Build.MODEL);
                data.put("platformId", 0);
                data.put("platformVersion", Build.VERSION.RELEASE);
                data.put("cloudMsgId", UserSettings.getGcmRegistrationToken(context));

                HttpCallHelper call = new HttpCallHelper(
                        "https://" + UserSettings.getAppEngineId(context)
                                + ".appspot.com/_ah/api/devicelab/v1/devices", data.toString());
                String response = call.getResponseString();
                Log.d(TAG, "Add Device Server Response " + response);

                JSONObject responseJson = new JSONObject(response);
                if (responseJson.has("id")) {
                    return responseJson.getString("id");
                } else if (responseJson.has("error")) {
                    JSONObject error = new JSONObject(responseJson.getString("error"));
                    if (error.has("message")) {
                        String message = error.getString("message");
                        if (message.equals("GCMError")) {
                            return message;
                        }
                    }
                }
            } catch (JSONException e) {
                Log.d(TAG, e.getMessage());
            } catch (IOException e) {
                Log.d(TAG, e.getMessage());
            } catch (URISyntaxException e) {
                Log.d(TAG, e.getMessage());
            }
            return null;
        }

        @Override
        protected void onPostExecute(String result) {
            mLoginProgressBar.setVisibility(View.GONE);
            if (result != null && result.equals("GCMError")) {
                UserSettings.setLoginFailureReason(context,
                        getResources().getString(R.string.login_verifying_failed) + " "
                                + getResources().getString(R.string.login_verifying_failed_push));
                logOut();
            } else if (result != null) {
                mLoginStatus.setVisibility(View.GONE);
                UserSettings.setDeviceServerId(context, result);
                refreshUI();
            } else {
                UserSettings.setLoginFailureReason(context,
                        getResources().getString(R.string.login_verifying_failed) + " "
                                + getResources().getString(R.string.login_verifying_failed_gae));
                logOut();
            }
        }
    }

    private class RemoveDeviceFromLab extends AsyncTask<String, Void, Boolean> {

        Context context;

        public RemoveDeviceFromLab(Context context) {
            this.context = context;
        }

        @Override
        protected void onPreExecute() {
            mLogoutProgressBar.setVisibility(View.VISIBLE);
            mLogoutStatus.setVisibility(View.VISIBLE);
            mLogoutStatus.setText(R.string.logout_verifying);
        }

        /**
         * @return null if success
         */
        @Override
        protected Boolean doInBackground(String... params) {
            try {
                String token = getGPlusIDToken(context);
                UserSettings.setDeviceGplusToken(context, token);

                String parameters = "accessToken=" + UserSettings.getDeviceGplusToken(context)
                        + "&userId=" + Plus.PeopleApi.getCurrentPerson(mGoogleApiClient).getId()
                        + "&deviceId=" + UserSettings.getDeviceServerId(context);

                HttpCallHelper call = new HttpCallHelper(
                        "https://" + UserSettings.getAppEngineId(context)
                                + ".appspot.com/_ah/api/devicelab/v1/devices?" + parameters, true);
                String response = call.getResponseString();
                Log.d(TAG, "Delete Device Server Response " + response);

                boolean success = false;
                String message = null;

                JSONObject responseJson = new JSONObject(response);
                if (call.getStatusCode() == 200) {
                    if (responseJson.has("success")) {
                        success = responseJson.getBoolean("success");
                        if (!success) {
                            message = responseJson.getString("error");
                        }
                    }
                } else if (call.getStatusCode() == 401) {
                    message = context.getResources().getString(R.string.logout_401_error);
                } else if (call.getStatusCode() == 404) {
                    //not found so device already deleted so we treat it as successful
                    success = true;
                }

                if (success) {
                    if (mGoogleApiClient.isConnected()) {
                        Plus.AccountApi.clearDefaultAccount(mGoogleApiClient);
                        mGoogleApiClient.disconnect();
                        mGoogleApiClient.connect();
                    }

                    UserSettings.setDeviceGplusToken(context, "");
                }

                return message == null;

            } catch (JSONException e) {
                Log.d(TAG, e.getMessage());
            } catch (IOException e) {
                Log.d(TAG, e.getMessage());
            } catch (URISyntaxException e) {
                Log.d(TAG, e.getMessage());
            }
            return false;
        }

        @Override
        protected void onPostExecute(Boolean result) {
            mLoginProgressBar.setVisibility(View.GONE);
            UserSettings.setDeviceServerId(context, "");
            refreshUI();
        }
    }


    private class GcmRegistration extends AsyncTask<String, Void, String> {

        Context context;

        public GcmRegistration(Context context) {
            this.context = context;
        }

        @Override
        protected String doInBackground(String... params) {
            Log.d(TAG, "Registering with push");
            String regId = null;
            try {
                regId = mGcm.register(UserSettings.getAppEngineNumber(context));
                Log.d(TAG, "Push regId " + regId + " for app engine number " + UserSettings
                        .getAppEngineNumber(context));
                //mGcm does send back a registration id even if we send a random number, as no check is done with package name (which isn't an element provided on server side)
                //The check is done by AddDeviceToLab API

            } catch (IOException ex) {
                Log.d(TAG, "GcmRegistration " + ex);
            }
            return regId;
        }

        @Override
        protected void onPostExecute(String result) {
            if (result != null) {
                UserSettings.setGcmRegistrationToken(context, result);
            } else {
                UserSettings.setGcmRegistrationToken(context, "");
            }
        }
    }

    private class GAEIdVerifier extends AsyncTask<String, Void, Boolean> {

        Context context;

        public GAEIdVerifier(Context context) {
            this.context = context;
        }


        @Override
        protected void onPreExecute() {
            UserSettings
                    .setAppEngineIdVerificationStatus(context, GAEIdVerificationStatus.VERIFYING);
            refreshUI();
        }

        @Override
        protected Boolean doInBackground(String... params) {
            try {
                HttpCallHelper call = new HttpCallHelper(
                        "https://" + UserSettings.getAppEngineId(context)
                                + ".appspot.com/_ah/api/devicelab/v1/devices");
                return call.getStatusCode() != 404;
            } catch (IOException e) {
                e.printStackTrace();
            } catch (URISyntaxException e) {
                e.printStackTrace();
            }
            return false;
        }

        @Override
        protected void onPostExecute(Boolean result) {
            if (result) {
                registerWithPush();
                UserSettings.setAppEngineIdVerificationStatus(context,
                        GAEIdVerificationStatus.VERIFICATION_PASSED);
            } else {
                UserSettings.setAppEngineIdVerificationStatus(context,
                        GAEIdVerificationStatus.VERIFICATION_FAILED_ID);
            }
            refreshUI();
        }
    }

}
