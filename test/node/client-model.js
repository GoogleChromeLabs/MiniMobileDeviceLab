const expect = require('chai').expect;

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
    const clientModel = new ClientModel(firebaseDb, 'example-client-type');
    return firebaseDb.once(`clients/${ClientModel.getDeviceName()}`)
    .then((value) => {
      expect(value).to.equal(null);
    })
    .then(() => {
      return clientModel.updateHeartbeat();
    })
    .then(() => {
      return firebaseDb.once(`clients/${ClientModel.getDeviceName()}`);
    })
    .then((value) => {
      expect(value.heartbeat).to.exist;
      expect(value['client-type']).to.equal('example-client-type');
    })
    .then(() => {
      return clientModel.updateHeartbeat();
    })
    .then(() => {
      return firebaseDb.once(`clients/${ClientModel.getDeviceName()}`);
    })
    .then((value) => {
      expect(value.heartbeat).to.exist;
      expect(value['client-type']).to.equal('example-client-type');
    });
  });

});
