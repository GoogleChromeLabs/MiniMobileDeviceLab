const os = require('os');

const MMDLError = require('../models/mmdl-error');

class ControllerInterface {
  constructor(firebaseDb, labName) {
    if (!firebaseDb) {
      throw new MMDLError('controller-no-firebase-db');
    }

    if (!labName) {
      throw new MMDLError('controller-no-lab-name');
    }
    this._firebaseDb = firebaseDb;
    this._labName = labName;
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
