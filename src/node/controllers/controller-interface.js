const os = require('os');

const MMDLError = require('../models/mmdl-error');

class ControllerInterface {
  constructor(firebaseDb, labId, controllerType) {
    if (!firebaseDb) {
      throw new MMDLError('controller-no-firebase-db');
    }

    if (!labId) {
      throw new MMDLError('controller-no-lab-id');
    }
    this._firebaseDb = firebaseDb;
    this._labId = labId;
    this._controllerType = controllerType;
  }

  _prepareFirebaseDb() {
    return Promise.all([
      this._firebaseDb.once('labs'),
      this._firebaseDb.once('servers'),
    ])
    .then((results) => {
      const labs = results[0] || {};
      if (!labs.index) {
        labs.index = -1;
      }
      if (!labs.urls) {
        labs.urls = [];
      }

      const servers = results[1] || {};

      return Promise.all([
        this._firebaseDb.database.ref('labs').set(labs),
        this._firebaseDb.database.ref('servers').set(servers),
      ]);
    });
  }

  getDeviceName() {
    let deviceName = os.hostname();
    if (deviceName.indexOf('.') >= 0) {
      deviceName = deviceName.substring(0, deviceName.indexOf('.'));
    }
    return deviceName;
  }

  _startServerHeartbeat() {
    let deviceName = this.getDeviceName();
    let refPath;
    
    switch (this._controllerType) {
      case 'server':
        refPath = `servers/${deviceName}`;
        break;
      default:
        refPath = `clients/${deviceName}`;
        break;
    }

    return this.updateHeartbeat(refPath)
    .then(() => {
      setInterval(() => {
        this.updateHeartbeat(refPath);
      }, 10 * 1000);
    });
  }

  updateHeartbeat(refPath) {
    const fbMonitorRef = this._firebaseDb.database.ref(refPath);
    return fbMonitorRef.child('heartbeat').set(new Date().toString());
  }
}

module.exports = ControllerInterface;
