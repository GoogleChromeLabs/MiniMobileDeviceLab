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

Setting Up Node Back-End
------------------------

To get the Node server up and running, do the followering:

	1. Install dependencies with: `npm install`
	2. Rename config.sample.js to config.js
	3. Update the config.js file with the appropriate values for the sql server.
	4. Get a G+ client ID from the developer console.


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

Building the AppEngine App
--------------------------

The AppEngine app is used for iOS devices, Desktop/Laptop devices or WebView
based apps.  It uses the Channel API to push messages out to the devices. 
When the app receives a POST message with the appropriate parameters, it 
will push the URL to any attached devices.

To add a device to the lab, open https://YourAppName.appspot.com/wall on the
device.  If the device is a desktop, be sure to click the "Tap me" button to
fire a user initiated gesture that will open a new window.  Otherwise the
browser may not open the window as a new tab.

The "background" page running on the device listens for a message (URL), and
will do a `window.open()` with the URL. To monitor status, without opening
a new page, simply uncheck the Open Pages checkbox.


Building the Web Front-End
---------------------------

The front end can be run seperate from node back-end with

`cd web-front-end`

`npm install`

`cd app`

`bower install`

`grunt serve`

To make a release version of the web front-end just run `grunt build` and copy the *web-front-end/dist* directory to your server to host.

Future of Device Lab
=====================

The major features / goals we have for Device Lab are:
- Support for more platforms
- Have a working version live in Play Store with available server
