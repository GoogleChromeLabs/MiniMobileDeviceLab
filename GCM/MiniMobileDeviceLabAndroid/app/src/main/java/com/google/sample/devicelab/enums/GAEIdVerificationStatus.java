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
package com.google.sample.devicelab.enums;


import android.content.Context;

import net.cogitas.devicelab.R;


public enum GAEIdVerificationStatus {
    NOT_VERIFIED(0, R.string.gae_not_verified, false),
    VERIFYING(1, R.string.gae_verifying, true),
    VERIFICATION_FAILED_ID(2, R.string.gae_verifying_id_failed, false),
    VERIFICATION_PASSED(3, R.string.gae_verifying_passed, false);

    private int id;
    private int resource;
    private boolean showProgressBar;

    GAEIdVerificationStatus(int id, int resource, boolean showProgressBar){
        this.id = id;
        this.resource = resource;
        this.showProgressBar = showProgressBar;
    }

    public int getId(){
        return id;
    }

    public String getDisplayString(Context context){
        return context.getResources().getString(resource);
    }

    public boolean showProgressBar(){
        return showProgressBar;
    }

    public static GAEIdVerificationStatus getFromId(int id){
        GAEIdVerificationStatus[] values = GAEIdVerificationStatus.values();
        for (int i = 0; i < values.length; i++){
            if (values[i].getId() == id){
                return values[i];
            }
        }
        return NOT_VERIFIED;
    }

}
