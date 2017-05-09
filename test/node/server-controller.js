const expect = require('chai').expect;
const sinon = require('sinon');

const ServerController = require(
  '../../src/node/controllers/server-controller');

describe('Server Controller', function() {
  let sinonClock = null;
  let stubs = [];
  let globalServerController;

  before(function() {
    sinonClock = sinon.useFakeTimers(Date.now());
  });

  after(function() {
    sinonClock.restore();
  });

  afterEach(function() {
    stubs.forEach((stub) => {
      stub.restore();
    });

    if (globalServerController) {
      globalServerController.stop();
    }
  });

  it('should throw if constructed without a firebase DB', function() {
    expect(function() {
      new ServerController();
    }).to.throw().property('code', 'server-controller-no-firebase-db');
  });

  it('should throw is server is already running', function() {
    globalServerController = new ServerController({
      isServerRunning: () => {
        return Promise.resolve(true);
      },
    });
    return globalServerController.start()
    .then(() => {
      throw new Error('Expected to reject promise.');
    }, (err) => {
      expect(err.code).to.equal('server-already-running');
    });
  });

  it('should throw if firebase db is not connected', function() {
    globalServerController = new ServerController({
      isServerRunning: () => {
        return Promise.resolve(false);
      },
      isConnected: () => {
        return Promise.resolve(false);
      },
    });
    return globalServerController.start()
    .then(() => {
      throw new Error('Expected to reject promise.');
    }, (err) => {
      expect(err.code).to.equal('not-connected-to-firebase');
    });
  });

  it('should mark the loop as running, start heart beat and ' +
    'begin loop on start', function() {
    let setLoopRunning = false;
    let startHeartbeat = false;

    const heartbeatStub = sinon.stub(
      ServerController.prototype, '_startServerHeartbeat');
    heartbeatStub.callsFake(() => {
      startHeartbeat = true;
      return Promise.resolve();
    });
    stubs.push(heartbeatStub);

    globalServerController = new ServerController({
      isServerRunning: () => {
        return Promise.resolve(false);
      },
      isConnected: () => {
        return Promise.resolve(true);
      },
      setLoopRunning: () => {
        setLoopRunning = true;
        return Promise.resolve();
      },
    });

    return globalServerController.start()
    .then(() => {
      expect(setLoopRunning).to.equal(true);
      expect(startHeartbeat).to.equal(true);
    });
  });

  it('should handle larger loopIndex than URLS', function() {
    const EXAMPLE_URL = 'https://example.com/1';
    const EXAMPLE_URL_TWO = 'https://example.com/2';
    let showUrlCalled = false;

    return new Promise((resolve) => {
      globalServerController = new ServerController({
        isServerRunning: () => {
          return Promise.resolve(false);
        },
        isConnected: () => {
          return Promise.resolve(true);
        },
        setLoopRunning: () => {
          return Promise.resolve();
        },
        getLoopIndex: () => {
          return Promise.resolve(3);
        },
        setLoopIndex: (newIndex) => {
          expect(newIndex).to.equal(1);
          resolve();
          return Promise.resolve();
        },
        getUrls: () => {
          return Promise.resolve([EXAMPLE_URL, EXAMPLE_URL_TWO]);
        },
      });

      const showurlStub = sinon.stub(globalServerController, '_showUrl');
      showurlStub.callsFake((url) => {
        showUrlCalled = true;
        expect(url).to.equal(EXAMPLE_URL);
        return Promise.resolve();
      });
      stubs.push(showurlStub);

      const heartbeatStub = sinon.stub(
        globalServerController, '_startServerHeartbeat');
      heartbeatStub.callsFake(() => {
        return Promise.resolve();
      });
      stubs.push(heartbeatStub);

      globalServerController.start()
      .then(() => {
        sinonClock.tick(5000);
      });
    })
    .then(() => {
      expect(showUrlCalled).to.equal(true);
    });
  });

  it('should step to next url after loop timeout', function() {
    const EXAMPLE_URL = 'https://example.com/1';
    const EXAMPLE_URL_TWO = 'https://example.com/2';
    const LOOP_TIMEOUT_PERIOD = 5001;

    const urlsShown = [];
    let currentIndex = 0;

    return new Promise((resolve) => {
      globalServerController = new ServerController({
        isServerRunning: () => {
          return Promise.resolve(false);
        },
        isConnected: () => {
          return Promise.resolve(true);
        },
        setLoopRunning: () => {
          return Promise.resolve();
        },
        getLoopIndex: () => {
          return Promise.resolve(currentIndex);
        },
        setLoopIndex: (newIndex) => {
          currentIndex = newIndex;
          if (urlsShown.length >= 3) {
            expect(urlsShown).to.deep.equal([
              EXAMPLE_URL,
              EXAMPLE_URL_TWO,
              EXAMPLE_URL,
            ]);
            resolve();
          } else {
            sinonClock.tick(LOOP_TIMEOUT_PERIOD);
          }
          return Promise.resolve();
        },
        getUrls: () => {
          return Promise.resolve([EXAMPLE_URL, EXAMPLE_URL_TWO]);
        },
      });

      const showurlStub = sinon.stub(globalServerController, '_showUrl');
      showurlStub.callsFake((url) => {
        urlsShown.push(url);
        return Promise.resolve();
      });
      stubs.push(showurlStub);

      const heartbeatStub = sinon.stub(
        globalServerController, '_startServerHeartbeat');
      heartbeatStub.callsFake(() => {
        return Promise.resolve();
      });
      stubs.push(heartbeatStub);

      globalServerController.start()
      .then(() => {
        sinonClock.tick(5000);
      });
    });
  });
});
