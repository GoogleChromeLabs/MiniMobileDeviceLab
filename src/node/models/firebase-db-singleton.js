const admin = require('firebase-admin');

const logHelper = require('../utils/log-helper');

class FirebaseDB {
  constructor(config, serviceAccount) {
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

  once(refPath) {
    return new Promise((resolve, reject) => {
      const fbRef = this.database.ref(refPath);
      fbRef.once('value', (snapshot) => {
        resolve(snapshot.val());
      }, reject);
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
