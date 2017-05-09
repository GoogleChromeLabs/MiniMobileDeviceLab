const firebase = require('firebase');
const admin = require('firebase-admin');

const logHelper = require('../utils/log-helper');


class FirebaseDB {
  constructor(config, serviceAccount) {
    this._fbInstance = firebase.initializeApp(config);

    const adminConfig = Object.assign({
      credential: admin.credential.cert(serviceAccount),
    }, config);
    this._adminInstace = admin.initializeApp(adminConfig);
  }

  get database() {
    if (this._database) {
      return this._database;
    }

    this._database = this._adminInstace.database();
    return this._database;
  }

  isServerRunning() {
    const loopRunningRef = this.database.ref('loop-controller-running');
    return loopRunningRef.once('value')
    .then((snapshot) => {
      return snapshot.val() ? true : false;
    });
  }

  setLoopRunning() {
    const loopRunningRef = this.database.ref('loop-controller-running');
    loopRunningRef.onDisconnect().remove();
    return loopRunningRef.set(true);
  }

  isConnected() {
    const isConnectedRef = this.database.ref('.info/connected');
    return isConnectedRef.once('value', (snapshot) => {
      return snapshot.val();
    });
  }
}

let firebaseDbInstance;
module.exports = (config, serviceAccount) => {
  if (firebaseDbInstance) {
    return firebaseDbInstance;
  }

  logHelper.warn('Creating a new firebase instance.......');
  firebaseDbInstance = new FirebaseDB(config, serviceAccount);
  return firebaseDbInstance;
};
