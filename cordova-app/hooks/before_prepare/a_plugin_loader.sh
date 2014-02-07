#!/bin/bash
 
echo "Removing Plugins";
cordova plugin remove co.uk.gauntface.cordova.plugin.nativegplussignin
cordova plugin remove co.uk.gauntface.cordova.plugin.gcmbrowserlaunch

echo "Adding Plugins";
cordova plugin add ./../cordova-plugins/nativegplussignin/
cordova plugin add ./../cordova-plugins/gcmbrowserlaunchplugin/
cordova plugin add org.apache.cordova.device