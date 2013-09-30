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

You may need to right click the src folder and go to `Build Path > Make Source Folder`. Then right click the war directory and go to `Build Path > Exclude`.

Right click project file, go to Java Build Path > Output folder - Browse` and select mini-device-lab/war/WEB-INF/classes.

Right click the project and go to `Properties > Java Build Path > Add JARs > mini-device-lab > war > WEB_INF > lib` and select all the jar files except `app-engine-api-1.0-sdk-1.7.4.jar`. Then go to `Add Library > Google App Engine > Finish`. Then finall go to `Add Library > JRE System Library > Finish`.

You'll need to add a Google Cloud Messaging API key in `mini-device-lab > src > utils > C.java` and follow the instructions [here](// Get your API key following these steps http://developer.android.com/google/gcm/gs.html)

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

A little bit of admin is needed to gain access to the Google Plus API, you'll need to create a project in the [Google API Console](https://code.google.com/apis/console/), switch on the Google Plus Service, then create a client ID for installed applications and create one for an Android app, which will require you debug key. Then just pop the client ID in `cordova-app/platforms/android/src/co/uk/gauntface/mobile/devicelab/C.java` for `DEBUG_CLIENT_ID`.

Then get the grunt task to build in the yeoman directory.

`cd cordova-app/yeoman`

`grunt debug-build`

`cordova prepare`

Once you've done that, the next step is to build the Android APK, which you'll need to import the Android project into IntelliJ or Eclipse (NOTE: Android Studio with Gradle hasn't been tested yet).

Then add a dependency on the [Google Play Services](http://developer.android.com/google/play-services/setup.html). This will give support for Google Cloud Messaging and Google Plus Sign In.

Now you've got yourself a working build :)

<p align="center">
  <img src="http://i.imgur.com/xxF0ovI.png" alt="Device Lab App"/>
</p>

Building the Web Front-End
---------------------------

You only need to do this if you are altering / developing the Web Front End.

The front end can be run seperate from app-engine with `grunt server`.

But if you want to produce a build for app-engine, the command `grunt build-prod` will build the site and copy it to the `app-engine` directory.

Future of Device Lab
=====================

The major features / goals we have for Device Lab are:
- Support for more platforms
- The backend running on a third party service
- Application launched in play store
