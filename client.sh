#!/bin/bash
# client.sh - Starts the MMDL Client

echo Getting latest bits...
git pull

echo "Copying login.sh file to root..."
cp login.sh ~/

echo Starting Mini Mobile Device Lab Client

cd PiLab

echo ""
echo Starting Monitor...
forever start monitor.js

echo ""
echo Starting ADB Server with sudo
sudo adb start-server

# echo ""
# echo Installing and updating node modules
# npm install

echo ""
echo Starting MMDL Client
node simple.js

echo ""
echo Rebooting in 30 seconds...
sleep 30
sudo reboot
