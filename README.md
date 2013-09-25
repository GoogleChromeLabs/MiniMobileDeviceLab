Mini Mobile Device Lab
======================

There is a real problem testing web pages across multiple devices and the multiple browsers on those 
devices (normally it is a case of manually going to each device and either entering a url or finding 
the synced tab).

This project is a Virtual Device Lab.  It allows you to quickly launch url's across all of a 
developers configured devices in an instant (you can even choose to launch chrome beta, 
opera, android browser etc).


Building the Cordova App
------------------------

This can be a little fiddly, but stick with it.

First, get the grunt task to build in the yeoman directory.

cd cordova-app/yeoman
grunt debug-build
cordova prepare

Once you've done that, the next step is to build the Android APK, to do this you'll need to import the Android project into IntelliJ or Eclipse (NOTE: Android Studio isn't currently supported).

Then add a dependency on the Google Play Services Extra http://developer.android.com/google/play-services/setup.html. This will give support for Google Cloud Messaging and Google Plus Sign In.

Now you've got yourself a working build :)

