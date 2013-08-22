package co.uk.gauntface.devicelab.appengine.utils;

import com.google.api.client.auth.openidconnect.IdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson.JacksonFactory;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

public class GPlusTokenInfo {
    public static String getUserId(String token) {
        try {
            JsonFactory jsonFactory = new JacksonFactory();
            GoogleIdToken idToken = GoogleIdToken.parse(jsonFactory, token);
            if (token == null) {
                return null;
            }
            
            // Verify valid token, signed by google.com, intended for 3P
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier(new NetHttpTransport(), new JacksonFactory());
            if (verifier.verify(idToken)) {
                Payload payload = idToken.getPayload();
                return payload.getSubject();
            }
        } catch (GeneralSecurityException e) {
        } catch (IOException e) {
        }
        return null;
    }
}
