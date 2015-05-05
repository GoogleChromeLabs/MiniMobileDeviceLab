#!/bin/bash
# client.sh - Starts the MMDL Client

echo Starting Mini Mobile Device Lab Client in 5 seconds...

cd PiLab

echo Starting ADB Server with sudo
sudo adb start-server

echo Installing & updating node modules
npm install

echo Starting MMDL Client
OUTPUT=$(node client.js 2>&1 >/dev/tty)
echo "${OUTPUT}"
date >> last_failure.txt
echo "" >> last_failure.txt
echo "${OUTPUT}" >> last_failure.txt
echo "" >> last_failure.txt
echo "" >> last_failure.txt
echo "-----" >> last_failure.txt
echo "" >> last_failure.txt

echo Rebooting in 30 seconds...
sleep 30
sudo reboot
