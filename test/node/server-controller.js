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
    }).to.throw().property('code', 'controller-no-firebase-db');
  });

   it('should throw if constructed without a lab ID', function() {
    expect(function() {
      new ServerController({});
    }).to.throw().property('code', 'controller-no-lab-id');
  });

  it('should throw is server is already running', function() {
    globalServerController = new ServerController({
      once: (dbPath) => {
        if (dbPath === `lab/example-lab-id/server-running`) {
          return Promise.resolve(true);
        }
        throw new Error('Unexpected db once path: ' + dbPath);
      },
    }, 'example-lab-id');
    return globalServerController.start()
    .then(() => {
      throw new Error('Expected to reject promise.');
    }, (err) => {
      expect(err.code).to.equal('server-already-running');
    });
  });

  it('should mark server as running and start heart beat', function() {
    let setServerRunning = false;
    let startHeartbeat = false;

    const heartbeatStub = sinon.stub(
      ServerController.prototype, '_startServerHeartbeat');
    heartbeatStub.callsFake(() => {
      startHeartbeat = true;
      return Promise.resolve();
    });
    stubs.push(heartbeatStub);

    const serverRunningStub = sinon.stub(
      ServerController.prototype, '_setServerRunning');
    serverRunningStub.callsFake(() => {
      setServerRunning = true;
      return Promise.resolve();
    });
    stubs.push(serverRunningStub);

    globalServerController = new ServerController({
      once: (dbPath) => {
        switch(dbPath) {
          case 'lab/example-lab-id/server-running': {
            return Promise.resolve(false);
          }
          default: {
            throw new Error('Expected once value: ', dbPath);
          }
        }
      },
      database: {
        ref: (refPath) => {
          if (refPath === `lab/example-lab-id/loop-speed`) {
            return {
              on: (eventName, cb) => {
                if (eventName === 'value') {
                  return cb({
                    val: () => {
                      return 30;
                    }
                  });
                }
                throw new Error('Unexpected event name given: ' + eventName);
              },
            };
          }

          throw new Error('Unexpected ref path given: ' + refPath);
        }
      }
    }, 'example-lab-id');

    return globalServerController.start()
    .then(() => {
      expect(setServerRunning).to.equal(true);
      expect(startHeartbeat).to.equal(true);
    });
  });

  it('should handle larger loopIndex than URLS', function() {
    const EXAMPLE_URL = 'https://example.com/1';
    const EXAMPLE_URL_TWO = 'https://example.com/2';
    let testIndex = -1;
    let shownUrl;
    let shownLoopIndex;

    globalServerController = new ServerController({}, 'example-lab-id');

    const getLoopIndexStub = sinon.stub(globalServerController, '_getLoopIndex');
    getLoopIndexStub.callsFake(() => {
      return Promise.resolve(testIndex);
    });
    stubs.push(getLoopIndexStub);

    const getUrlsStub = sinon.stub(globalServerController, '_getUrls');
    getUrlsStub.callsFake(() => {
      return Promise.resolve([
        EXAMPLE_URL,
        EXAMPLE_URL_TWO,
      ]);
    });
    stubs.push(getUrlsStub);

    const seturlStub = sinon.stub(globalServerController, '_setUrl');
    seturlStub.callsFake((url) => {
      shownUrl = url;
      return Promise.resolve();
    });
    stubs.push(seturlStub);

    const setLoopIndexStub = sinon.stub(globalServerController, '_setLoopIndex');
    setLoopIndexStub.callsFake((loopIndex) => {
      shownLoopIndex = loopIndex;
      testIndex = loopIndex;
      return Promise.resolve();
    });
    stubs.push(setLoopIndexStub);

    return globalServerController._onLoopIteration()
    .then(() => {
      expect(shownUrl).to.equal(EXAMPLE_URL);
      expect(shownLoopIndex).to.equal(0);

      return globalServerController._onLoopIteration();
    })
    .then(() => {
      expect(shownUrl).to.equal(EXAMPLE_URL_TWO);
      expect(shownLoopIndex).to.equal(1);

      return globalServerController._onLoopIteration();
    })
    .then(() => {
      expect(shownUrl).to.equal(EXAMPLE_URL);
      expect(shownLoopIndex).to.equal(0);
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
