const EventEmitter = require('events');
const os = require('os');
const pkg = require('../../../package');

const logHelper = require('../utils/log-helper');

const SEGMENT = {
  CLIENTS: 'clients',
  HEARTBEAT: 'heartbeat',
  STARTED: 'started-at',
  VERSION: 'version',
  DEVICES: 'connected-devices',
  KILL_PROCESS: 'kill-process',
  CONNECTED_AT: 'connected-at',
  DISCONNECTED_AT: 'disconnected-at',
  ALIVE: 'alive',
  LAST_URL_SHOWN: 'last-url-shown',
};

class ClientModel extends EventEmitter {
  constructor(firebaseDb, clientType) {
    super();

    this._firebaseDb = firebaseDb;
    this._clientType = clientType;

    this.ready = this._initialise()
    .then(() => {
      return this._addLifecycleTriggers();
    });
  }

  _getClientRef() {
    return this._firebaseDb.database.ref([
      SEGMENT.CLIENTS, ClientModel.getDeviceName(), this._clientType,
    ].join('/'));
  }

  _initialise() {
    const values = {};
    values[SEGMENT.HEARTBEAT] = null;
    values[SEGMENT.STARTED] = new Date().toString();
    values[SEGMENT.VERSION] = pkg.version;
    values[SEGMENT.DEVICES] = null;
    values[SEGMENT.KILL_PROCESS] = false;

    return this._getClientRef().set(values);
  }

  _addLifecycleTriggers() {
    // Kill Process.
    const killRef = this._getClientRef().child(SEGMENT.KILL_PROCESS);
    killRef.onDisconnect().remove();
    killRef.on('value', (snapshot) => {
      if (snapshot.val() === true) {
        logHelper.warn('Received signal to exit process.');
        process.exit();
      }
    });

    this._firebaseDb.database.ref('.info/connected').on('value', (snapshot) => {
      if (snapshot.val() !== true) {
        return;
      }

      // Conencted
      const connectedRef = this._getClientRef().child(SEGMENT.CONNECTED_AT);
      connectedRef.set(new Date().toString());

      // Disconnected
      const disconnectedRef = this._getClientRef()
        .child(SEGMENT.DISCONNECTED_AT);
      disconnectedRef.remove();
      disconnectedRef.onDisconnect().set(new Date().toString());

      // Alive
      const aliveRef = this._getClientRef().child(SEGMENT.ALIVE);
      aliveRef.set(true);
      aliveRef.onDisconnect().set(false);
    });
  }

  addConnectedDevice(deviceId) {
    const aliveRef = this._getClientRef().child([
      SEGMENT.DEVICES, deviceId,
    ].join('/'));
    return aliveRef.set(true);
  }

  removeConnectedDevice(deviceId) {
    const aliveRef = this._getClientRef().child([
      SEGMENT.DEVICES, deviceId,
    ].join('/'));
    return aliveRef.remove();
  }

  setLastShownUrl(lastUrl) {
    const urlRef = this._getClientRef().child(SEGMENT.LAST_URL_SHOWN);
    return urlRef.set({
      url: lastUrl,
      time: new Date().toString(),
    });
  }

  updateHeartbeat() {
    const heartbeatRef = this._getClientRef().child(SEGMENT.HEARTBEAT);
    return heartbeatRef.set(new Date().toString());
  }

  static getDeviceName() {
    let deviceName = os.hostname();
    if (deviceName.indexOf('.') >= 0) {
      deviceName = deviceName.substring(0, deviceName.indexOf('.'));
    }
    return deviceName;
  }
}

module.exports = ClientModel;
