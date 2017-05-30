const os = require('os');

const MMDLError = require('../models/mmdl-error');

class ControllerInterface {
  constructor(firebaseDb, labId) {
    if (!firebaseDb) {
      throw new MMDLError('controller-no-firebase-db');
    }

    if (!labId) {
      throw new MMDLError('controller-no-lab-id');
    }
    this._firebaseDb = firebaseDb;
    this._labId = labId;
  }

  getDeviceName() {
    let deviceName = os.hostname();
    if (deviceName.indexOf('.') >= 0) {
      deviceName = deviceName.substring(0, deviceName.indexOf('.'));
    }
    return deviceName;
  }
}

module.exports = ControllerInterface;
