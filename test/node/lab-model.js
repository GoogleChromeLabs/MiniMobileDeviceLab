const expect = require('chai').expect;

const LabModel = require('../../src/node/models/lab-model');

const firebaseConfig = require('../demo/firebase-details');
const firebaseServiceAccount = require('../demo/firebase-service-account.json');
const getFirebaseDb = require('../../src/node/models/firebase-db-singleton');

describe('LabModel', function() {
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

  it('should initialise firebase DB', function() {
    return LabModel.initialiseFirebase(firebaseDb, 'example-lab-id')
    .then(() => {
      return firebaseDb.once('labs/example-lab-id');
    })
    .then((labContent) => {
      expect(labContent).to.deep.equal({
        'current-url': '',
        'loop-speed-secs': 10,
        'server-running': false,
        'url-index': -1,
        'urls': ['https://developers.google.com/web/'],
      });
    });
  });

  it('should get loop speed', function() {
    const labModel = new LabModel(firebaseDb, 'example-lab-id');
    return labModel.getLoopSpeedSecs()
    .then((loopSpeed) => {
      // Default is 10.
      expect(loopSpeed).to.equal(10);
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/loop-speed-secs').set(1);
    })
    .then(() => {
      return labModel.getLoopSpeedSecs();
    })
    .then((loopSpeed) => {
      expect(loopSpeed).to.equal(1);
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/loop-speed-secs').set('invalid');
    })
    .then(() => {
      return labModel.getLoopSpeedSecs();
    })
    .then((loopSpeed) => {
      expect(loopSpeed).to.equal(10);
    });
  });

  it('should get loop speed change event', function() {
    const loopEvents = [];
    let finalChange = false;
    return new Promise((resolve) => {
      return LabModel.initialiseFirebase(firebaseDb, 'example-lab-id')
    .then(() => {
      const labModel = new LabModel(firebaseDb, 'example-lab-id');

      labModel.on('loop-speed-change', (data) => {
        loopEvents.push(data);

        if (finalChange) {
          expect(loopEvents).to.deep.equal([1, 2, 3]);
          resolve();
        }
      });
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/loop-speed-secs').set(1);
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/loop-speed-secs').set(2);
    })
    .then(() => {
      finalChange = true;
      return firebaseDb.database.ref('labs/example-lab-id/loop-speed-secs').set(3);
    });
    });
  });

  it('should get server running', function() {
    const labModel = new LabModel(firebaseDb, 'example-lab-id');
    return labModel.isServerRunning()
    .then((serverRunning) => {
      expect(serverRunning).to.equal(false);
    })
    .then(() => {
      return labModel.markServerAsRunning();
    })
    .then(() => {
      return labModel.isServerRunning();
    })
    .then((serverRunning) => {
      expect(serverRunning).to.equal(true);
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/server-running').set(false);
    })
    .then(() => {
      return labModel.isServerRunning();
    })
    .then((serverRunning) => {
      expect(serverRunning).to.equal(false);
    });
  });

  it('should get lab urls', function() {
    const labModel = new LabModel(firebaseDb, 'example-lab-id');
    return labModel.getUrls()
    .then((urls) => {
      expect(urls).to.deep.equal([]);
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/urls').set([
        'https://developers.google.com/web/',
        'https://developers.google.com/web/fundamentals/',
      ]);
    })
    .then(() => {
      return labModel.getUrls();
    })
    .then((urls) => {
      expect(urls).to.deep.equal([
        'https://developers.google.com/web/',
        'https://developers.google.com/web/fundamentals/',
      ]);
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/urls').set('not-a-url');
    })
    .then(() => {
      return labModel.getUrls();
    })
    .then((urls) => {
      expect(urls).to.deep.equal([]);
    });
  });

  it('should get and set the current URL', function() {
    const labModel = new LabModel(firebaseDb, 'example-lab-id');
    return labModel.getCurrentUrl()
    .then((currentUrl) => {
      expect(currentUrl).to.equal(null);
    })
    .then(() => {
      return labModel.setCurrentUrl('http://developers.google.com/web/');
    })
    .then(() => {
      return labModel.getCurrentUrl();
    })
    .then((url) => {
      expect(url).to.equal('http://developers.google.com/web/');
    })
    .then(() => {
      return labModel.setCurrentUrl({
        'nonsense': 'this is a bad value.',
      });
    })
    .then(() => {
      return labModel.getCurrentUrl();
    })
    .then((url) => {
      expect(url).to.equal('http://developers.google.com/web/');
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/current-url').set({
        'nonsense': 'this is a bad value.',
      });
    })
    .then(() => {
      return labModel.getCurrentUrl();
    })
    .then((url) => {
      expect(url).to.equal(null);
    });
  });

  it('should get and set the loop index', function() {
    const labModel = new LabModel(firebaseDb, 'example-lab-id');
    return labModel.getUrlIndex()
    .then((loopIndex) => {
      expect(loopIndex).to.equal(-1);
    })
    .then(() => {
      return labModel.setUrlIndex(123);
    })
    .then(() => {
      return labModel.getUrlIndex();
    })
    .then((loopIndex) => {
      expect(loopIndex).to.equal(123);
    })
    .then(() => {
      return labModel.setUrlIndex({
        'nonsense': 'this is a bad value.',
      });
    })
    .then(() => {
      return labModel.getUrlIndex();
    })
    .then((loopIndex) => {
      expect(loopIndex).to.equal(123);
    })
    .then(() => {
      return firebaseDb.database.ref('labs/example-lab-id/url-index').set({
        'nonsense': 'this is a bad value.',
      });
    })
    .then(() => {
      return labModel.getUrlIndex();
    })
    .then((loopIndex) => {
      expect(loopIndex).to.equal(-1);
    });
  });
});
