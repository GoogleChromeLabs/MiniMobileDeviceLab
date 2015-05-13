Mini Mobile Device Lab
======================

# Steps to Get Going

1. Copy config.sample.json to config.json.
2. Fill in the attributes of config.json accordingly.
    1. 'firebaseUrl' is the URL for your firebase project.
    2. 'firebaseKey' is the api key for that firebase project.
    3. 'frontEndUrl' is the URL for where you've hosted PiLabFrontEnd.
3. Run the server somewhere with 'node server.js'.
4. Run the client on the Pi or computer connected to the hub with the devices with 'node client.js'.
5. Visit the PiLabFrontEnd to control everything.


# Auto Starting PiLab on Command Line Boot

1. Clone the repo to your Pi
1. Add `./login.sh` to the end of your local `.profile`
1. Create `./login.sh` and add the following code:
```
cd ~/MiniMobDevLab
echo Starting PiLab in 5 seconds
sleep 5
./client.sh
```
1. Run `chmod +x login.sh` 

You may want to change `client.sh` to `server.sh` depending on your config.

# Auto Starting PiLab on GUI

1. Clone the repo to your pi
1. Ensure forever is install `npm install forever -g`
1. Edit the `PiLab/scripts/startup.sh` file to use client.js or server.js 
1. If you don't have `MiniMobileDeviceLab` in your home directory, alter the location of the repo.
1. You should alter the path to the adb, current it assumes adb is at `/home/pi/adb`
1. Copy the `PiLab/scripts/startup.sh` file to /etc/init.d/pilab-startup and add it to the boot process with:

    sudo cp <path>/startup.sh /etc/init.d/pilab-startup
    sudo chmod 755 /etc/init.d/pilab-startup

    sudo update-rc.d pilab-startup defaults

## Cheating Install

curl -s https://raw.githubusercontent.com/GoogleChrome/MiniMobileDeviceLab/master/scripts/install.sh | bash
