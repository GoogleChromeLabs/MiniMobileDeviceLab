<p align="center">
  <img src="http://i.imgur.com/ZT75eem.png" alt="Device Lab Logo"/>
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

<!--Building the App Engine App
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
</p>-->

Building the Cordova App
------------------------

Start of with getting the yeoman project building.

`cd cordova-app/yeoman`

`npm install`

`sudo npm install -g grunt-cli`

Then get the cordova side of things building. Make sure you have the Android tools, ant on your path (i.e. `android`).

`npm install -g cordova`

`cd ..`

`mkdir www`

`cordova platform add android`

Next up a little bit of fiddly admin work.

To gain access to the Google Plus API you'll need to create a project in the [Google API Console](https://code.google.com/apis/console/).

    1. Switch on the *Google+ API* in the APIs & Auth section.
    2. Go to *APIS & AUTH* > *Credentials* and create a new client ID for *Installed application*, specifically Android in this case. This will require the debug signing key which is normally in ~/.android/debug.keystore. `keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -list -v`
    Then copy the SHA1 value into the *Create client ID* field and use "co.uk.gauntface.mini.mobile.devicelab" for the package name.
    3. Rename the C.sample.java file to C.java in `cordova-plugins/platforms/nativegplussignin/src/android/`
	4. Then take the client ID and add it to `cordova-plugins/platforms/nativegplussignin/src/android/C.java` as the  `DEBUG_CLIENT_ID` value.
	5. Next up rename the config.sample.js file in `cordova-app/yeoman/app/scripts/` and add your URL to the node server (i.e. the IP address of the machine you are hosting the node server on)

To install and run on an Android device, plugin in the device and run the following

`cd cordova-app`

`cordova run android`

<p align="center">
  <img src="http://i.imgur.com/uKCv5d1.png" alt="Device Lab App"/>
</p>

Building the Web Front-End
---------------------------

The front end can be run seperate from node back-end with

`cd web-front-end`

`npm install`

`cd app`

`bower install`

`grunt serve`


Future of Device Lab
=====================

The major features / goals we have for Device Lab are:
- Support for more platforms
- Have a working version live in Play Store with available server
