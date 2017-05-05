#!/bin/bash

sudo wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb

git clone https://github.com/GoogleChrome/MiniMobileDeviceLab.git /home/pi/MiniMobileDeviceLab/

cd /home/pi/MiniMobileDeviceLab/PiLab

npm install
sudo npm install -g forever

sudo cp /home/pi/MiniMobileDeviceLab/PiLab/scripts/startup.sh /etc/init.d/pilab-startup
sudo chmod 755 /etc/init.d/pilab-startup

sudo update-rc.d pilab-startup defaults