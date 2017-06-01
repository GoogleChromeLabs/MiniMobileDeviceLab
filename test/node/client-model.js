const expect = require('chai').expect;

const pkg = require('../../package');
const ClientModel = require('../../src/node/models/client-model');

const firebaseConfig = require('../demo/firebase-details');
const firebaseServiceAccount = require('../demo/firebase-service-account.json');
const getFirebaseDb = require('../../src/node/models/firebase-db-singleton');

describe('ClientModel', function() {
  let firebaseDb;

  const clearDb = () => {
    const rootRef = firebaseDb.database.ref();
    return rootRef.set(null);
  };

  before(function() {
    this.timeout(5 * 1000);

    firebaseDb = getFirebaseDb(firebaseConfig, firebaseServiceAccount);
    return clearDb();
  });

  afterEach(function() {
    this.timeout(5 * 1000);

    return clearDb();
  });

  it('should update heartbeat', function() {
    const refPath = `clients/${ClientModel.getDeviceName()}/example-client-type`;
    const clientModel = new ClientModel(firebaseDb, 'example-client-type');
    return clientModel.ready
    .then(() => {
      return firebaseDb.once(refPath);
    })
    .then((value) => {
      expect(value.heartbeat).to.not.exist;
      expect(value['started-at']).to.exist;
      expect(value.version).to.equal(pkg.version);
      expect(value.devices).to.not.exist;
      expect(value['kill-process']).to.equal(false);
    })
    .then(() => {
      return clientModel.updateHeartbeat();
    })
    .then(() => {
      return firebaseDb.once(refPath);
    })
    .then((value) => {
      expect(value.heartbeat).to.exist;
    })
    .then(() => {
      return clientModel.updateHeartbeat();
    })
    .then(() => {
      return firebaseDb.once(refPath);
    })
    .then((value) => {
      expect(value.heartbeat).to.exist;
    });
  });

});
