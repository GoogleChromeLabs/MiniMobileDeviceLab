<p align="center">
  <img src="http://i.imgur.com/mOthLyL.png" alt="Device Lab Logo"/>
</p>

Mini Mobile Device Lab
======================

There is a real problem testing web pages across multiple devices and the browsers that run on them. The best solutions today are to either enter a url to a tool to manage the devices or use applications across the devices, keeping them open and testing in a WebView.

This project is a Virtual Device Lab. It allows you to quickly launch URLs across all configured devices in an instant, selecting which browser to launch.

This is still in early stages of development, which means you can probably expect things to break, but we'd love help, bugs and feature requests.

<p align="center">
  <a href="http://youtu.be/DgwntGgosTQ">
  	<img src="http://i.imgur.com/8Pyoc1E.png" alt="Device Lab Front End"/>
  </a>
</p>

Building the App Engine App
---------------------------

You'll need [Eclipse with the App Engine plugin](https://developers.google.com/appengine/docs/java/gettingstarted/installing) installed to run the server.

Sidenote: You have two options, create a new project and just copy the code OR attempt to import and handle any issues. I've actually found it easier to do the former, but here is some hints for the latter.

Open Eclipse and import the project `File > Import` and set the directory to `app-engine` which should display the `mini-device-lab` project as an option.

You may need to right click the src folder and go to `Build Path > Make Source Folder`. Then right click the war directory and go to `Build Path > Exclude`.

Right click the project heading and select properting, in the popup window select `Java Build Path > Output folder - Browse` and select `mini-device-lab/war/WEB-INF/classes`.

Right click the project and go to `Java Build Path > Add JARs > mini-device-lab > war > WEB_INF > lib` and select all the jar files except `app-engine-api-1.0-sdk-1.7.4.jar`. Then go to `Add Library > Google App Engine > Finish`. Then finall go to `Add Library > JRE System Library > Finish`.

You'll need to add a Google Cloud Messaging API key in `mini-device-lab > src > utils > C.java`, you can do this by following the instructions @ [here](http://developer.android.com/google/gcm/gs.html)

You'll need to make the local server accessible on your network so mobile devices can access it. To do this go to `Run > Run Configurations`, go to the arguments tab and add `--address=0.0.0.0 ` to the start of any existing text.

You can view the controller site @ [http://localhost:8888/front-end/](http://localhost:8888/front-end/)

You'll then want to configure the mobile app to use this server, so open config.js in `cordova-app/yeoman/app/scripts/config.js` and add your local IP address.

`var localIP = 'http://<your_ip_addr>:8888';`

<p align="center">
  <img src="http://i.imgur.com/gCvZhRL.png" alt="Device Lab Front End"/>
</p>

Building the Cordova App
------------------------

This can be a little fiddly I'm afraid.

A little bit of admin is needed to gain access to the Google Plus API, so you'll need to create a project in the [Google API Console](https://code.google.com/apis/console/), switch on the Google Plus Service, then create a client ID for installed applications, specifically Android in this case, which will require the debug signing key your Android SDK uses. Then just pop the client ID in `cordova-app/platforms/android/src/co/uk/gauntface/mobile/devicelab/C.java` for `DEBUG_CLIENT_ID`.

Then build the application with the following commands:

`cd cordova-app/yeoman`

`grunt debug-build`

`cordova prepare`

Once you've done that, the next step is to build the Android APK, which means you'll need to import the  project into IntelliJ or Eclipse (NOTE: Android Studio with Gradle hasn't been tested yet).

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
- Have a working version live in Play Store with available server
