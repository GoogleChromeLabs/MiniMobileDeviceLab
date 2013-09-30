<p align="center">
  <img src="http://i.imgur.com/mOthLyL.png" alt="Device Lab Logo"/>
</p>

Mini Mobile Device Lab
======================

There is a real problem testing web pages across multiple device form factors and the browsers that run on them (normally it's a case of manually entering a url or IP address on each device).

This project is a Virtual Device Lab.  It allows you to quickly launch url's across all of a  configured devices in an instant, selecting which browser to launch.

<p align="center">
<iframe width="420" height="315" src="//www.youtube.com/embed/qmfNZXADCwQ" frameborder="0" allowfullscreen></iframe>
</p>

Building the App Engine App
---------------------------

You'll need [Eclipse with the App Engine plugin](https://developers.google.com/appengine/docs/java/gettingstarted/installing) installed to run the server.

Open Eclipse and import the project `File > Import` and set the directory to `app-engine` which should display the `mini-device-lab` project as an option.

You'll need to make the local server accessible on your local network. To do this go to `Run > Run Configurations`, go to the arguments tab and add `--address=0.0.0.0 ` to the start of the existing text.

You can view the controller site @ [http://localhost:8888/front-end/](http://localhost:8888/front-end/)

You'll then want to configure the mobile app to use this server, so open config.js in `cordova-app/yeoman/app/scripts/config.js` and add your local IP.

`var localIP = 'http://<your_ip_addr>:8888';`

<p align="center">
  <img src="http://i.imgur.com/gCvZhRL.png" alt="Device Lab Front End"/>
</p>

Building the Cordova App
------------------------

This can be a little fiddly I'm afraid, but we can get through it.

First, get the grunt task to build in the yeoman directory.

`cd cordova-app/yeoman`

`grunt debug-build`

`cordova prepare`

Once you've done that, the next step is to build the Android APK, which you'll need to import the Android project into IntelliJ or Eclipse (NOTE: Android Studio with Gradle hasn't been tested yet).

Then add a dependency on the [Google Play Services](http://developer.android.com/google/play-services/setup.html). This will give support for Google Cloud Messaging and Google Plus Sign In.

Now you've got yourself a working build :)

<p align="center">
  <img src="http://i.imgur.com/xxF0ovI.png" alt="Device Lab App"/>
</p>

Future of Device Lab
=====================

The major features / goals we have for Device Lab are:
- Support for more platforms
- The backend running on a third party service
- Application launched in play store
