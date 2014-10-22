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
package com.google.devrel.mobiledevicelab.form;



/**
 * Pojo representing a server response with error message
 */
public class ResponseForm {

  /**
   * The error message
   */
  private String error;

  /**
   * The success status
   */
  private boolean success;


  /**
   * A success message
   */
  private String message;

  /**
   * Just making the default constructor private.
   */
  private ResponseForm() {
  }

  /**
   * @param errorMessage The error message
   * @param success Whether it is successful or not
   * @param message A success message
   */
  public ResponseForm(String errorMessage, boolean success, String message) {
    this.error = errorMessage;
    this.success = success;
    this.message = message;
  }

  public String getError() {
    return error;
  }

  public boolean isSuccess() {
    return success;
  }

  public String getMessage() {
    return message;
  }



}
