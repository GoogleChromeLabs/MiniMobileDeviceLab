/**
 * Copyright 2013 Google Inc. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package co.uk.gauntface.devicelab.appengine.utils;

import com.google.api.client.auth.openidconnect.IdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson.JacksonFactory;

import java.io.IOException;
import java.security.GeneralSecurityException;

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
