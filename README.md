Mini Mobile Device Lab
======================

**Goal of the project**

To enable website developers to test their websites on several devices with one click.
Mobile devices can be any device with a browser (desktop, laptop, smartphone, tablet etc).

**Code organisation**

This project consists of 2 elements:
- a Google App Engine app, written in Java, in the folder MiniMobileDeviceLabAppEngine
- an Android app, in the folder MiniMobileDeviceLabAndroid. 

**App Engine Java app setup**
- Download the code in the folder MiniMobileDeviceLabAppEngine
- Go to Google developer console at https://console.developers.google.com and create a new project
- Rename or copy the src/main/webapp/WEB-INF/appengine-web.sample.xml to src/main/webapp/WEB-INF/appengine-web.xml
- Open the appengine-web.xml file and change "your-app-id" to your project ID
- In the Google developer console, select your project, and click on "APIs" in left menu. Make sure you enable "Google Cloud Messaging For Android" and "Google+ API".
- Then, in left menu, click on "Consent Screen", enter your email address and project name, and click on save.
- Then, in left menu, click on "Credentials". Select "Create New Key" and follow the instructions (enter 0.0.0.0/0 for IPs). Then, select "create new Client ID", choose "web application" and follow the instructions.
- The two keys created above need to be inserted in the file src/main/java/com/google/devrel/mobiledevicelab/Constants.java, in API_KEY and WEB_CLIENT_ID respectively.
- Additionally, the client id needs to be inserted in src/main/wenapp/index.html and listen.html, replacing the string "web-client-id" with your new web application client id.

**Android App setup**
- (TODO)

**Adding Android devices to lab**
- Install the Android app
- Enter the project id and number onto the device
- Login with your G+ id
- You can close the app if required

**Adding Non Android devices to lab**
- Go to https://your-app-id.appspot.com/listen.html on the browser of your choice
- Login with G+ and enter the name you want to use for this device/browser
- You must stay on this page during your testing session
- For Safari, make sure you allow pop ups

**Your devices lab**
- Go to https://your-app-id.appspot.com
- Login with G+
- You should see a list of your Android and non Android devices
- For Android devices, you can select which browser to use (if the browser isn't installed on your device, it will open the play store for it)
- Enter your url at the top and push the "Send" icon
- Go to your devices - your url should have been launched!
- The device lab page refreshes automatically when you connect or disconnect a new device
- Max connection time for a non android device is 2 hours (due to technical limitations of Channel API). There is no time limit for Android devices.

**Need more than 25 devices in your lab?**
- There is a currently a limit of 25 access tokens per G+ login.
- You can use a second G+ login for your extra devices
- Then, go to the GAE console for your App Engine app at https://appengine.google.com/dashboard and select "Datastore Viewer" in the left menu
- In the Query tab, change to "LabOwner". You should see your G+ logins in there, using the user id of your G+ profile. Each user id have a different groupId by default. Click on the one for the extra devices and change the groupId to the same value as your main one. Now, you will be able to see all your devices in the same lab, as a lab is linked to a groupId and not a userId.

