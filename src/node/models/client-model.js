const EventEmitter = require('events');
const os = require('os');

const logHelper = require('../utils/log-helper');

const SEGMENT = {
  CLIENTS: 'clients',
  TYPE: 'client-type',
  HEARTBEAT: 'heartbeat',
};

class ClientModel extends EventEmitter {
  constructor(firebaseDb, clientType) {
    super();

    this._firebaseDb = firebaseDb;
    this._clientType = clientType;
  }

  updateHeartbeat() {
    const fbMonitorRef = this._firebaseDb.database.ref([
      SEGMENT.CLIENTS, ClientModel.getDeviceName(),
    ].join('/'));
    const values = {};
    values[SEGMENT.HEARTBEAT] = new Date().toString();
    values[SEGMENT.TYPE] = this._clientType;
    return fbMonitorRef.set(values);
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
