/**
 * @fileoverview
 * Provides model
 *
  */

/** google global namespace for Google projects. */
var google = google || {};

/** devrel namespace for Google Developer Relations projects. */
google.devrel = google.devrel || {};

/** namespace for DevRel mobiledevicelab code. */
google.devrel.mobiledevicelab = google.devrel.mobiledevicelab || {};

/**
 * The signin token
 */
google.devrel.mobiledevicelab.token = "";

/**
 * The user id
 */
google.devrel.mobiledevicelab.userId = "";

/**
 * The devices of the logged in user
 */
google.devrel.mobiledevicelab.devices = null;

/**
 * The UI state of each device (browser selected, toggle on/off)
 */
google.devrel.mobiledevicelab.devicesState = new Object();;

/**
 * The state of the main on/off toggle
 */
google.devrel.mobiledevicelab.androidDevicesSwitchedOff = false;
