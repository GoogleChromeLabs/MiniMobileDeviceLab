# Mini Mobile Device Lab

The Mini Mobile Device Lab (MMDL) is a framework to help developers test pages
across multiple devices, including phones, tablets, Desktops, etc. It works with
Android, iOS, Windows (including phone, RT and desktop), and Chrome OS. 

When a A URL is pushed, the devices will simultaneously open the page, allowing
you to see how the page looks across each device. In addition, it will also run
the page through services like
[PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/),
[Web Page Test](http://www.webpagetest.org/), and check for specific open web
features like HTTPS, Service Worker, Theme Color, and Web App Manifests.

## Basic Architecture

A web front end is used to send URLs to [Firebase](https://www.firebase.com),
which acts as the back end, syncing URLs out to all of the connected devices.

**Android:** The Node client app running on a Raspberry Pi (or other computer)
listens for new URLs and uses ADB to fire a browse intent, opening the URL on
the device. 

**iOS & Windows:** A native app receives URLs from Firebase and opens them in a
WebView. 

**ChromeOS or Chrome Desktop:** A Chrome Extension listens for new URLs sent
from Firebase and opens a new tab or uses the existing tab to display the
content.

## Getting Started

### Setup Firebase & front end

1. Create a new Firebase app (and account if necessary)
1. Import the initial config from [`init-data.json`](https://github.com/GoogleChrome/MiniMobileDeviceLab/blob/master/FirebaseSetup/init-data.json)
1. In **Security & Rules**, paste the contents of [`rules.json`](https://github.com/GoogleChrome/MiniMobileDeviceLab/blob/master/FirebaseSetup/rules.json)
1. In **Login & Auth**, enable Anonymous Authentication
1. In **Secrets**, create a new Secret, and note it down for later.
1. In _PiLabFrontEnd_, copy [`config.sample.js`](https://github.com/GoogleChrome/MiniMobileDeviceLab/blob/master/PiLabFrontEnd/config.sample.js) to `config.js`
1. Fill in the attributes of `config.js` accordingly.
    1. `firebaseUrl` is the URL for your Firebase project.
    1. `firebaseKey` is the api key for that Firebase project.
1. Deploy the _PiLabFrontEnd_, you can use Firebase’s static hosting or one of
your choosing

If you want to test pages using PageSpeed Insights or WebPage Test, be sure to
get an API Key and update `config.apiKeys` in Firebase with the appropriate key.


### Set up the server

The server is used to control the looper, manage test execution, update Firebase
with results tests and handle a few other functions. If you don’t want to use
the looper or test pages, you can skip this section.

 **PreRequisites:** Node (0.12.x), ADB

1. Clone the repo to a local directory
1. In the `PiLab` folder, run `npm install` 
1. Copy [`config.sample.json`](https://github.com/GoogleChrome/MiniMobileDeviceLab/blob/master/PiLab/config.sample.json) to `config.json`.
1. Fill in the attributes of `config.json` accordingly.
    1. `firebaseUrl` is the URL for your Firebase project.
    1. `firebaseKey` is the api key for that Firebase project.
    1. `frontEndUrl` is the URL for where you've hosted the **PiLabFrontEnd**.
1. Start the server with `node server.js`.
1. Plug a single Android device into this computer, it will be used for testing
the open web features.


### Android

 **PreRequisites:** Node (0.12.x), ADB

1. Follow the same step as required to set up the server, but instead, start the
client with `node client.js`
1. On each Android device, enable **Developer Mode**
1. Under **Developer Options**: 
    1. Enable **USB Debugging**
    1. Enable **Stay awake**
1. Install [Stay Alive!](https://play.google.com/store/apps/details?id=com.synetics.stay.alive)
to prevent the screen from dimming or turning off
1. Plug the Android devices into the computer or USB hub.
1. When prompted, allow USB debugging, and be sure to choose Remember this
computer.


### iOS

**PreRequisites:** XCode & all of the other pre-reqs for building iOS apps

1. Clone the repo to a local directory and open the project in XCode
1. In [`ViewController.m`](https://github.com/GoogleChrome/MiniMobileDeviceLab/blob/master/iOS/Browser2/ViewController.m), change `fbAppName` to the Firebase App name you created earlier
1. Deploy app to iOS devices


### Windows

Because there is no native Firebase SDK for Windows, we’ve used two WebViews to
control the experience. One WebView (`wvListener`) listens for notifications
pushed via `window.external.notify`, when a message is received, it sets the URL
of the second WebView (`wvMain`) to the new URL.

**PreRequisites:** Visual Studio 2012 & all of the other pre-reqs for building
Universal Windows Apps.

1. Clone the repo to a local directory and open the proejct in Visual Studio
1. In `MainPage.xaml` for both MMDL-uni.Windows and MMDL-uni.WindowsPhone,
update the URL of `<WebView x:Name="wvListener" Source="https://goog-mtv-device-lab.appspot.com/notify.html" HorizontalAlignment="Stretch" VerticalAlignment="Stretch"></WebView>`
to the **PiLabFrontEnd** URL you created earlier.
1. In `Package.appxmanifest` for both MMDL-uni.Windows and MMDL-uni.WindowsPhone,
update the URL of `<Rule Match="https://goog-mtv-device-lab.appspot.com/notify.html" Type="include" />`
to the **PiLabFrontEnd** URL you created earlier
1. Deploy app to the appropriate devices

## Sending URLs to devices

Once the devices have been setup, you can use the web front end to send URLs.
The simplest way is to use `index.html` to send a single URL, it will pause the
looper for 3 minutes then automatically restart it. For more advanced control,
use `admin.html`, which allows you to change the displays on different devices,
adjust the loop time, add or modify URLs in the loop, etc.

## Using Raspberry Pi’s as Controllers

Raspberry Pi’s work well for controlling the Android devices or as the Server,
and is how we set up the MMDL at Google IO 2015.

There are a few things to be aware of:
* Raspberry Pi’s have limited USB bandwidth, which may cause issues if you try
to connect more than 7 devices to a Pi, we limited each Pi to 6 devices.
* We recommended that you boot the Pi into command line mode instead of the GUI
to lower CPU usage.
* We used the 7-port [Ankar AH240](http://www.amazon.com/gp/product/B00HRQ3ZES)
for our USB hub since it provided a sufficient number of USB ports and enough
power to keep most devices fully charged while in use.
* ADB is not available pre-compiled for the Pi, so you’ll need to compile your
own, or download one that someone else has compiled.
* You may need to start ADB with `sudo` for proper functionality.

### Auto Starting PiLab on Boot To Command Line

If your Pi boots to the command line, you can automatically start the PiLab
client (or server) with these steps.

1. On the Pi, run `sudo nano /etc/inittab` to edit the `inittab` file
2. Find the line `1:2345:respawn:/sbin/getty 115200 tty1` and comment it out by
adding a `#` at the beginning of the line.
3. Just below the commented out line, add `1:2345:respawn:/bin/login -f pi tty1 </dev/tty1 >/dev/tty1 2>&1`.
4. Save and Exit `nano` by pressing CTRL-X, followed by Y
5. [Optional] Reboot the Pi to confirm it automatically logs in.
6. If you haven’t already, clone the repo to your Pi
7. Edit the local `.profile` file and add `~/login.sh` to the end.
8. Create `~/login.sh` and add the following code:
```
cd ~/MiniMobDevLab
echo Starting PiLab in 5 seconds
sleep 5
./client.sh
```
9. Make the `~/login.sh` file executable by running `chmod +x ~/login.sh` 
10. Reboot the Pi, and it should automatically log in and start the client app.


## Contributing

The Mini Mobile Device Lab is an open source project and we welcome your
contributions! Before submitting a pull request, please review
[CONTRIBUTING.md](https://github.com/GoogleChrome/MiniMobileDeviceLab/blob/master/CONTRIBUTING.md)
and make sure that there is an issue filed describing the fix or new content. If
you don't complete these steps, we won't be able to accept your pull request,
sorry.
