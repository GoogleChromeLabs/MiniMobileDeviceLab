const ControllerInterface = require('./controller-interface');
const logHelper = require('../utils/log-helper');
const intentUtils = require('../utils/intent-utils');
const deviceController = require('./device-controller');
const LabModel = require('../models/lab-model');

class ClientController extends ControllerInterface {
  constructor(firebaseDb, labId) {
    super(firebaseDb, labId, 'client');

    this._labModel = new LabModel(firebaseDb, labId);
  }

  start() {
    return super.start()
    .then(() => {
      deviceController.on('device-added', (event) => {
        return Promise.all([
          this._clientModel.addConnectedDevice(event.deviceId),
          this._launchKeepScreenOn(event.deviceId)
          .then(() => {
            return this._labModel.getCurrentUrl();
          })
          .then((currentUrl) => {
            return this._showUrlOnDevice(currentUrl, event.deviceId);
          }),
        ]);
      });

      deviceController.on('device-removed', (event) => {
        return this._clientModel.removeConnectedDevice(event.deviceId);
      });

      return deviceController.init();
    })
    .then(() => {
      this._labModel.on('current-url-change', (newUrl) => {
        this._showUrlOnAllDevices(newUrl);
      });
    });
  }

  _showUrlOnAllDevices(newUrl) {
    if (!newUrl) {
      logHelper.warn('There is currently no URL set.');
      return;
    }

    this._clientModel.setLastShownUrl(newUrl);

    const devices = deviceController.getDevices();
    const promises = Object.keys(devices).map((deviceId) => {
      return this._showUrlOnDevice(newUrl, deviceId);
    });
    return Promise.all(promises);
  }

  _showUrlOnDevice(url, deviceId) {
    const chromeIntent = intentUtils.buildChromeIntent(url);
    const genericIntent = intentUtils.buildGenericBrowserIntent(url);

    return deviceController.triggerIntent(deviceId, chromeIntent)
    .catch((err) => {
      logHelper.warn('Unable to launch Chrome intent. Attempting generic ' +
        'browser intent.');
      return deviceController.triggerIntent(deviceId, genericIntent);
    })
    .catch((err) => {
      logHelper.error('Unable to launch Browser intent.', err.message);
    });
  }

  _launchKeepScreenOn(deviceId) {
    const keepScreenOnIntent = {
      'wait': true,
      'action': 'android.intent.category.LAUNCHER',
      'component': 'com.synetics.stay.alive/.main',
    };

    return deviceController.triggerIntent(deviceId, keepScreenOnIntent)
    .catch((err) => {
      logHelper.error('Unable to launch keep screen on intent.',
        err.message);
    });
  }
}

module.exports = ClientController;
