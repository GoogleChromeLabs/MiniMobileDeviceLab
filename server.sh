#!/bin/bash
# server.sh - Starts the MMDL Server

echo Starting Mini Mobile Device Lab Server

cd PiLab

echo Installing & upddating node modules
npm install

echo Starting MMDL Server
OUTPUT=$(node server.js 2>&1 >/dev/tty)
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
