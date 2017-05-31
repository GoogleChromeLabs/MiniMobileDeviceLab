const firebase = require('firebase');

const ControllerInterface = require('./controller-interface');
const logHelper = require('../utils/log-helper');
const intentUtils = require('../utils/intent-utils');
const deviceController = require('./device-controller');

const VERSION = '20170412-1309';

class ClientController extends ControllerInterface {
  constructor(firebaseDb, labName) {
    super(firebaseDb, labName, 'client');

    this._currentUrl = 'https://www.google.com';
    this._urlLastChanged = 0;
    this._reportPath = `clients/${this.getDeviceName()}/`;
  }

  start() {
    this._clientStartedAt = Date.now();

    logHelper.log('');
    logHelper.log('MiniMobileDeviceLab > ClientController');
    logHelper.log('   lab:', this._labName);
    logHelper.log('   version:', VERSION);
    logHelper.log('   computerName:', this.getDeviceName());
    logHelper.log('   started at:', new Date().toLocaleString());
    logHelper.log('');

    return deviceController.init()
    .then(() => {
      this._heartbeat();
      this._startUpdateMonitor();
      return this._showUrlOnAllDevices(this._currentUrl);
    })
    .then(() => {
      return this._initialiseState();
    })
    .then(() => {
      deviceController.on('device-added', (event) => {
        this._launchKeepScreenOn(event.deviceId)
        .then(() => {
          return this._showUrlOnDevice(
            this._currentUrl, event.deviceId);
        })
        .then(() => {
          const database = this._firebaseDb.database;
          database.ref(`${this._reportPath}devices/${event.deviceId}`)
            .set(true);

          deviceController.on('device-removed', (event) => {
            const database = this._firebaseDb.database;
            database.ref(`${this._reportPath}devices/${event.deviceId}`)
              .remove();
          });
        });
      });
    });
  }

  _initialiseState() {
    const database = this._firebaseDb.database;
    database.ref(`${this._reportPath}startedAt`)
      .set(new Date().toLocaleString());
    database.ref(`${this._reportPath}version`).set(VERSION);
    database.ref(`${this._reportPath}devices`).remove();
    database.ref(`${this._reportPath}rebooting`).remove();
    database.ref(`${this._reportPath}timeSinceChange`).set(0);

    database.ref(`${this._reportPath}reboot`).set(false);
    database.ref(`${this._reportPath}reboot`).onDisconnect().remove();
    database.ref(`${this._reportPath}reboot`).on('value', (snapshot) => {
      if (snapshot.val() === true) {
        logHelper.warn('Received signal to reboot Pi.');
        process.exit();
      }
    });

    database.ref('.info/connected').on('value', (snapshot) => {
      if (snapshot.val() !== true) {
        return;
      }

      logHelper.log('Firebase Connected');
      const database = this._firebaseDb.database;
      database.ref(`${this._reportPath}connectedAt`)
        .set(new Date().toLocaleString());
      database.ref(`${this._reportPath}connectedAt`)
        .onDisconnect().remove();
      database.ref(`${this._reportPath}alive`).set(true);
      database.ref(`${this._reportPath}alive`).onDisconnect().set(false);
      database.ref(`${this._reportPath}disconnectedAt`).remove();
      database.ref(`${this._reportPath}disconnectedAt`)
        .onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
    });

    database.ref(`lab/${this._labName}/current-url`)
      .on('value', (snapshot) => this.onUrlChange(snapshot.val()));
  }

  onUrlChange(newUrl) {
    if (!newUrl) {
      logHelper.warn('There is currently no URL set.');
      return;
    }

    this._currentUrl = newUrl;
    this._urlLastChanged = Date.now();

    logHelper.log('Url change:');
    logHelper.log(`    ${this._currentUrl}`);
    logHelper.log(`    ${new Date().toLocaleString()}`);
    logHelper.log(`    ` +
      `${Object.keys(deviceController.getDevices()).join(', ')}`);

    const database = this._firebaseDb.database;
    database.ref(`${this._reportPath}url`).set(this._currentUrl);
    database.ref(`${this._reportPath}urlTime`)
      .set(new Date().toLocaleString());
    database.ref(`${this._reportPath}timeSinceChange`).set(0);

    this._showUrlOnAllDevices(this._currentUrl);
  }

  _showUrlOnAllDevices(url) {
    const devices = deviceController.getDevices();

    const promises = Object.keys(devices).map((deviceId) => {
      return this._showUrlOnDevice(url, deviceId);
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

  _heartbeat() {
    const HEARTBEAT_INTERVAL = 60 * 1000;

    logHelper.log('>> Heartbeat', new Date().toLocaleString());

    setTimeout(() => this._heartbeat(), HEARTBEAT_INTERVAL);
  }

  _startUpdateMonitor() {
    const MAX_TIME_BETWEEN_UPDATES = 75;
    const TIME_BETWEEN_UPDATES_INTERVAL = 3 * 1000;

    setInterval(() => {
      const timeSinceChange = (Date.now() - this._urlLastChanged) / 1000;
      if (this._urlLastChanged !== 0 &&
        timeSinceChange > MAX_TIME_BETWEEN_UPDATES) {
        const msg = 'URL Change Timeout: ' + timeSinceChange + 's';
        logHelper.log(msg);
        process.exit();
      } else {
        const database = this._firebaseDb.database;
        database.ref(`${this._reportPath}timeSinceChange`).set(timeSinceChange);
      }
    }, TIME_BETWEEN_UPDATES_INTERVAL);
  }
}

module.exports = ClientController;
