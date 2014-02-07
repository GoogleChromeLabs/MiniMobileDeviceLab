cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/co.uk.gauntface.cordova.plugin.nativegplussignin/www/nativegplussignin.js",
        "id": "co.uk.gauntface.cordova.plugin.nativegplussignin.nativegplussignin",
        "clobbers": [
            "nativegplussignin"
        ]
    },
    {
        "file": "plugins/co.uk.gauntface.cordova.plugin.gcmbrowserlaunch/www/gcmlaunchbrowser.js",
        "id": "co.uk.gauntface.cordova.plugin.gcmbrowserlaunch.gcmlaunchbrowser",
        "clobbers": [
            "gcmlaunchbrowser"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.device": "0.2.7",
    "co.uk.gauntface.cordova.plugin.nativegplussignin": "0.0.1",
    "co.uk.gauntface.cordova.plugin.gcmbrowserlaunch": "0.0.1"
}
// BOTTOM OF METADATA
});