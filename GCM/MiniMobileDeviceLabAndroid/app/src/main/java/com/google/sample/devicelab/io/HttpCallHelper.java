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
package com.google.sample.devicelab.io;

import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URISyntaxException;

/**
 * Instantiate this class to create a server call, it contains helper methods to retrieve status
 * code and response string
 */
public class HttpCallHelper {

    private final static String TAG = "HttpCallHelper";

    private String responseString;

    private int statusCode;

    /**
     * Use this constructor for a GET request
     *
     * @param url The full url, including parameters
     * @throws IOException        If the connection cannot be made
     * @throws URISyntaxException If url is malformed
     */
    public HttpCallHelper(String url) throws IOException, URISyntaxException {
        executeCall(new HttpGet(url), null);
    }

    /**
     * Use this constructor for a DELETE request
     *
     * @param url    The full url, including parameters
     * @param delete Pass in true for DELETE, false for GET
     * @throws IOException        If the connection cannot be made
     * @throws URISyntaxException If url is malformed
     */
    public HttpCallHelper(String url, boolean delete) throws IOException, URISyntaxException {
        executeCall(delete ? new HttpDelete(url) : new HttpGet(url), null);
    }

    /**
     * Use this constructor for a POST request
     *
     * @param url     The url of the post request
     * @param payload The data to post to the url, expected to be JSON
     * @throws IOException        If the connection cannot be made
     * @throws URISyntaxException If url is malformed
     */
    public HttpCallHelper(String url, String payload) throws IOException, URISyntaxException {
        executeCall(new HttpPost(url), payload);
    }

    //TODO - add a constructor for each with headers


    public int getStatusCode() {
        return statusCode;
    }

    public String getResponseString() {
        return responseString;
    }

    /**
     * @param payLoad The payload is expected to be JSON
     */
    private void executeCall(HttpRequestBase protocol, String payLoad)
            throws IOException, URISyntaxException {
        HttpClient httpclient = new DefaultHttpClient();
        if (payLoad != null) {
            ((HttpPost) protocol).setEntity(new StringEntity(payLoad));
            ((HttpPost) protocol).setHeader("Accept", "application/json");
            ((HttpPost) protocol).setHeader("Content-type", "application/json");
        }
        HttpResponse response = httpclient.execute(protocol);
        StatusLine statusLine = response.getStatusLine();
        statusCode = statusLine.getStatusCode();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        if (response.getEntity() != null) {
            response.getEntity().writeTo(out);
        }
        out.close();
        responseString = out.toString();
    }
}
