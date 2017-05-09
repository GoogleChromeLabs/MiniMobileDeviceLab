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
    return this._once('loop-controller-running')
    .then((value) => {
      return value ? true : false;
    });
  }

  setLoopRunning() {
    const loopRunningRef = this.database.ref('loop-controller-running');
    loopRunningRef.onDisconnect().remove();
    return loopRunningRef.set(true);
  }

  isConnected() {
    return this._once('.info/connected');
  }

  getUrls() {
    return this._once('loop/urls')
    .then((value) => {
      return value || [];
    });
  }

  getLoopIndex() {
    return this._once('loop/index')
    .then((value) => {
      return value || 0;
    });
  }

  setLoopIndex(newLoopIndex) {
    const loopIndexRef = this.database.ref('loop/index');
    return loopIndexRef.set(newLoopIndex);
  }

  _once(refPath) {
    return new Promise((resolve, reject) => {
      const fbRef = this.database.ref(refPath);
      fbRef.once('value', (snapshot) => {
        resolve(snapshot.val());
      });
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
