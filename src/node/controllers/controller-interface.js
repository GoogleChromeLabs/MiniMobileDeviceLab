
const MMDLError = require('../models/mmdl-error');
const LabModel = require('../models/lab-model');
const ClientModel = require('../models/client-model');

class ControllerInterface {
  constructor(firebaseDb, labId, clientType) {
    if (!firebaseDb) {
      throw new MMDLError('controller-no-firebase-db');
    }

    if (!labId) {
      throw new MMDLError('controller-no-lab-id');
    }
    this._firebaseDb = firebaseDb;
    this._labId = labId;

    this._clientModel = new ClientModel(firebaseDb, clientType);
  }

  start() {
    return Promise.all([
      this._prepareFirebaseDb(),
      this._startHeartbeat(),
    ]);
  }

  _prepareFirebaseDb() {
    return LabModel.initialiseFirebase(this._firebaseDb, this._labId);
  }

  _startHeartbeat() {
    return this._clientModel.updateHeartbeat()
    .then(() => {
      setInterval(() => {
        this._clientModel.updateHeartbeat();
      }, 10 * 1000);
    });
  }
}

module.exports = ControllerInterface;
