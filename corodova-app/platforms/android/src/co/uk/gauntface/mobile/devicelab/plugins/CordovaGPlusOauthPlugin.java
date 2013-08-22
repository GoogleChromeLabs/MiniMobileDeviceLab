package co.uk.gauntface.mobile.devicelab.plugins;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.accounts.AccountManagerCallback;
import android.accounts.AccountManagerFuture;
import android.accounts.AuthenticatorException;
import android.accounts.OperationCanceledException;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.ApplicationInfo;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;


import com.google.android.gms.auth.GoogleAuthException;
import com.google.android.gms.auth.GoogleAuthUtil;
import com.google.android.gms.auth.GooglePlayServicesAvailabilityException;
import com.google.android.gms.auth.UserRecoverableAuthException;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesClient;
import com.google.android.gms.plus.PlusClient;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;

import co.uk.gauntface.mobile.devicelab.C;

public class CordovaGPlusOauthPlugin extends CordovaPlugin implements GooglePlayServicesClient.ConnectionCallbacks, GooglePlayServicesClient.OnConnectionFailedListener {

    private static final String PRODUCTION_CLIENT_ID = "148156526883-o5idu9ocjcafdfrtts27p2ojv7bggc5s.apps.googleusercontent.com";
    private static final String DEBUG_CLIENT_ID = "148156526883-fr8venmd66rn418s0qc5ilbtq7mbnqu9.apps.googleusercontent.com";

    private static final int REQUEST_CODE_RESOLVE_ERR = 9000;

    private PlusClient mPlusClient;
    private ConnectionResult mConnectionResult;
    private CallbackContext mCallbackContext;

    private String getClienId() {
        boolean isDebuggable =  ((this.cordova.getActivity().getApplicationInfo().flags &= ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        return isDebuggable ? DEBUG_CLIENT_ID : PRODUCTION_CLIENT_ID;
    }

    private PlusClient getPlusClient() {
        if(mPlusClient == null) {
            mPlusClient = new PlusClient.Builder(this.cordova.getActivity(), this, this)
                    .build();
        }

        return mPlusClient;
    }

    @Override
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
        Log.v(C.TAG, "CordovaGPlusOauthPlugin: execute() action = "+action);
        if(action.equals("loginGPlus")) {
            this.cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    mCallbackContext = callbackContext;
                    CordovaGPlusOauthPlugin.this.cordova.setActivityResultCallback(CordovaGPlusOauthPlugin.this);

                    if (!getPlusClient().isConnected()) {
                        Log.v(C.TAG, "CordovaGPlusOauthPlugin: Signing into G+");
                        getPlusClient().connect();
                    } else {
                        Log.v(C.TAG, "CordovaGPlusOauthPlugin: Already connected to G+");
                        new IDTokenFetcher(CordovaGPlusOauthPlugin.this.cordova.getActivity(), mCallbackContext).execute(mPlusClient.getAccountName());
                    }
                }
            });

        }

        return true;
    }

    @Override
    public void onActivityResult(int requestCode, int responseCode, Intent intent) {
        Log.v(C.TAG, "onActivityResult()");
        if (requestCode == REQUEST_CODE_RESOLVE_ERR && responseCode == Activity.RESULT_OK) {
            mConnectionResult = null;
            Log.v(C.TAG, "onActivityResult() - getPlusClient().connect()");
            getPlusClient().connect();
        } else {
            super.onActivityResult(requestCode, responseCode, intent);
        }
    }

    @Override
    public void onConnected(Bundle bundle) {
        Log.v(C.TAG, "onConnected() = "+mPlusClient.getAccountName());
        new IDTokenFetcher(this.cordova.getActivity(), mCallbackContext).execute(mPlusClient.getAccountName());
    }

    @Override
    public void onDisconnected() {
        Log.v(C.TAG, "onDisconnected()");
        mCallbackContext.error("Failed to connect");
    }

    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {
        Log.v(C.TAG, "onConnectionFailed()");
        if (connectionResult.hasResolution()) {
            try {
                Log.v(C.TAG, "connectionResult.startResolutionForResult()");
                connectionResult.startResolutionForResult(this.cordova.getActivity(), REQUEST_CODE_RESOLVE_ERR);
            } catch (IntentSender.SendIntentException e) {
                Log.v(C.TAG, "onConnectionFailed getPlusClient().connect()");
                getPlusClient().connect();
            }
        }

        // Save the intent so that we can start an activity when the user clicks
        // the sign-in button.
        mConnectionResult = connectionResult;
    }


    private class IDTokenFetcher extends AsyncTask<String, Void, String> {

        private Context mContext;
        private CallbackContext mCallbackContext;

        public IDTokenFetcher(Context context, CallbackContext callbackContext) {
            mContext = context;
            mCallbackContext = callbackContext;
        }

        @Override
        protected String doInBackground(String... params) {
            Log.v(C.TAG, "CordovaGPlusOauthPlugin: IDTokenFetcher doInBackground()");
            try {
                String scope = "audience:server:client_id:148156526883-75soacsqseft7npagv6226t9pg0vtbel.apps.googleusercontent.com";
                final String token = GoogleAuthUtil.getToken(mContext, params[0], scope);
                return token;
            } catch (GooglePlayServicesAvailabilityException playEx) {
                // Consider
            } catch (UserRecoverableAuthException userAuthEx) {
                // Handling
            } catch (IOException transientEx) {
                // These
            } catch (GoogleAuthException authEx) {
                // Exceptions
            }
            return null;
        }

        protected void onPostExecute(String result){
            if(result != null) {
                JSONObject idTokenJsonObj = new JSONObject();
                try {
                    idTokenJsonObj.put("id_token", result);
                    mCallbackContext.success(idTokenJsonObj);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            } else {
                mCallbackContext.error("Failed to send id_token to JS layer");
            }
        }
    }







    private class OnTokenAcquired implements AccountManagerCallback<Bundle> {

        private CallbackContext mCallbackContext;

        public OnTokenAcquired(CallbackContext callbackContext) {
            mCallbackContext = callbackContext;
        }

        @Override
        public void run(final AccountManagerFuture<Bundle> result) {
            // Get the result of the operation from the AccountManagerFuture.
            Runnable runnable = new Runnable() {
                @Override
                public void run() {
                    Bundle bundle = null;
                    try {
                        bundle = result.getResult();
                        // The token is a named value in the bundle. The name of the value
                        // is stored in the constant AccountManager.KEY_AUTHTOKEN.
                        String token = bundle.getString(AccountManager.KEY_AUTHTOKEN);

                        URL url = new URL("https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + token);
                        URLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.addRequestProperty("client_id", getClienId());
                        conn.setRequestProperty("Authorization", "OAuth " + token);

                        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));

                        StringBuilder stringBuilder = new StringBuilder();
                        String inputLine;
                        while ((inputLine = in.readLine()) != null) {
                            stringBuilder.append(inputLine);
                        }
                        in.close();

                        String response = stringBuilder.toString();

                        JSONObject userObj = new JSONObject(response);
                        mCallbackContext.success(userObj.getString("id"));
                        return;
                    } catch (OperationCanceledException e) {
                        Log.e("CordovaGOauthPlugin", "run() Exception", e);
                    } catch (IOException e) {
                        Log.e("CordovaGOauthPlugin", "run() Exception", e);
                    } catch (AuthenticatorException e) {
                        Log.e("CordovaGOauthPlugin", "run() Exception", e);
                    } catch (JSONException e) {
                        Log.e("CordovaGOauthPlugin", "run() Exception", e);
                    }

                    Log.v("CordovaGOauthPlugin", "run() error(-1)");
                    mCallbackContext.error(-1);
                }
            };
            new Thread(runnable).start();
        }
    }

}