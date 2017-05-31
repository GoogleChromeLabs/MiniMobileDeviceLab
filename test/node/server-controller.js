const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const firebaseConfig = require('../demo/firebase-details');
const firebaseServiceAccount = require('../demo/firebase-service-account.json');

const getFirebaseDb = require('../../src/node/models/firebase-db-singleton');
const ServerController = require('../../src/node/controllers/server-controller');

describe('Server Controller', function() {
  let firebaseDb;
  let stubs = [];
  let globalServerController;

  const clearDb = () => {
    const rootRef = firebaseDb.database.ref();
    return rootRef.set(null);
  };

  before(function() {
    firebaseDb = getFirebaseDb(firebaseConfig, firebaseServiceAccount);
    return clearDb();
  });

  afterEach(function() {
    stubs.forEach((stub) => {
      stub.restore();
    });

    if (globalServerController) {
      globalServerController.stop();
    }

    return clearDb();
  });

  it('should throw if constructed without a firebase DB', function() {
    expect(function() {
      new ServerController();
    }).to.throw().property('code', 'controller-no-firebase-db');
  });

   it('should throw if constructed without a lab ID', function() {
    expect(function() {
      new ServerController({});
    }).to.throw().property('code', 'controller-no-lab-id');
  });

  it('should throw if server is already running', function() {
    return firebaseDb.database.ref(`lab/example-lab-id/server-running`).set(true)
    .then(() => {
      globalServerController = new ServerController(firebaseDb, 'example-lab-id');
      return globalServerController.start();
    })
    .then(() => {
      throw new Error('Expected to reject promise.');
    }, (err) => {
      expect(err.code).to.equal('server-already-running');
    });
  });

  it('should generate an outline in firebase on start up', function() {
    this.timeout(20 * 1000);
    globalServerController = new ServerController(firebaseDb, 'example-lab-id');
    return globalServerController.start()
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 10 * 1000);
      });
    });
  });

  it('should mark server as running and start heart beat', function() {
    globalServerController = new ServerController(firebaseDb, 'example-lab-id');
    return globalServerController.start()
    .then(() => {
      return firebaseDb.once(`lab/example-lab-id/server-running`);
    })
    .then((isRunning) => {
      expect(isRunning).to.equal(true);
    })
    .then(() => {
      return firebaseDb.once(`servers`);
    })
    .then((serverValue) => {
      const serverKeys = Object.keys(serverValue);
      expect(serverKeys.length).to.equal(1);

      const value = serverValue[serverKeys[0]];
      expect(value.heartbeat).to.exist;
    });
  });

  it('should loop over URLS', function() {
    this.timeout(20 * 1000);

    const EXAMPLE_URL = 'https://example.com/1';
    const EXAMPLE_URL_TWO = 'https://example.com/2';
    let eventCallbacks = {};
    return firebaseDb.database.ref(`lab/example-lab-id/urls`).set([
      EXAMPLE_URL,
      EXAMPLE_URL_TWO,
    ])
    .then(() => {
      return new Promise((resolve) => {
        const ProxiedServerController = proxyquire('../../src/node/controllers/server-controller', {
        '../models/loop-behavior': function() {
          return {
            on: (eventName, cb) => {
              eventCallbacks[eventName] = cb;
            },
            startLoop: () => {
              resolve();
            },
          };
        },
      });
      const testServerController = new ProxiedServerController(firebaseDb, 'example-lab-id');
      return testServerController.start();
      });
    })
    .then(() => {
      return eventCallbacks['loop-iteration']();
    })
    .then(() => {
      return firebaseDb.once('lab/example-lab-id');
    })
    .then((value) => {
      expect(value.index).to.equal(0);
      expect(value['current-url']).to.equal(EXAMPLE_URL);
    })
    .then(() => {
      return eventCallbacks['loop-iteration']();
    })
    .then(() => {
      return firebaseDb.once('lab/example-lab-id');
    })
    .then((value) => {
      expect(value.index).to.equal(1);
      expect(value['current-url']).to.equal(EXAMPLE_URL_TWO);
    })
    .then(() => {
      return eventCallbacks['loop-iteration']();
    })
    .then(() => {
      return firebaseDb.once('lab/example-lab-id');
    })
    .then((value) => {
      expect(value.index).to.equal(0);
      expect(value['current-url']).to.equal(EXAMPLE_URL);
    });
  });
});
