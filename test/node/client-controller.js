const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const ClientController = require('../../src/node/controllers/client-controller');

describe('ClientController', function() {
  it('should throw if constructed without a firebase DB', function() {
    expect(function() {
      new ClientController();
    }).to.throw().property('code', 'controller-no-firebase-db');
  });

   it('should throw if constructed without a lab ID', function() {
    expect(function() {
      new ServerController({});
    }).to.throw().property('code', 'controller-no-lab-id');
  });

  it('should throw if server is already running', function() {
    const ServerController = proxyquire('../../src/node/controllers/server-controller', {
      './controller-interface': class FakeInterface {
        start() {
          return Promise.resolve();
        }
      },
      '../models/lab-model': class FakeLabModel {
        on() {}

        isServerRunning() {
          return Promise.resolve(true);
        }
      },
    });

    globalServerController = new ServerController({}, 'example-lab-id');
    return globalServerController.start()
    .then(() => {
      throw new Error('Expected to reject promise.');
    }, (err) => {
      expect(err.code).to.equal('server-already-running');
    });
  });

  it('should call super.start() (It sets up firebase project)', function() {
    return new Promise((resolve) => {
      const ServerController = proxyquire('../../src/node/controllers/server-controller', {
        './controller-interface': class FakeInterface {
          start() {
            resolve();
          }
        },
        '../models/lab-model': class FakeLabModel {
          on() {}

          isServerRunning() {
            return Promise.resolve(true);
          }
        },
      });
      globalServerController = new ServerController({}, 'example-lab-id');
      globalServerController.start();
    });
  });

  it('should loop over URLS', function() {
    const EXAMPLE_URL = 'https://example.com/1';
    const EXAMPLE_URL_TWO = 'https://example.com/2';
    let eventCallbacks = {};

    let currentUrlIndex = -1;
    let currentUrl;
    let urls = [
      EXAMPLE_URL,
      EXAMPLE_URL_TWO,
    ];

    return new Promise((resolve) => {
      const ServerController = proxyquire('../../src/node/controllers/server-controller', {
        './controller-interface': class FakeInterface {
          start() {
            resolve();
          }
        },
        '../models/lab-model': class FakeLabModel {
          on() {}

          isServerRunning() {
            return Promise.resolve(true);
          }

          getUrlIndex() {
            return Promise.resolve(currentUrlIndex);
          }

          getUrls() {
            return Promise.resolve(urls);
          }

          setCurrentUrl(newUrl) {
            currentUrl = newUrl;
          }

          setUrlIndex(newIndex) {
            currentUrlIndex = newIndex;
          }
        },
        '../models/loop-behavior': class FakeLoopBehavior {
          on(eventName, cb) {
            eventCallbacks[eventName] = cb;
          }

          startLoop() {
            resolve();
          }
        }
      });
      globalServerController = new ServerController({}, 'example-lab-id');
      globalServerController.start()
    })
    .then(() => {
      return eventCallbacks['loop-iteration']();
    })
    .then(() => {
      expect(currentUrlIndex).to.equal(0);
      expect(currentUrl).to.equal(EXAMPLE_URL);
    })
    .then(() => {
      return eventCallbacks['loop-iteration']();
    })
    .then((value) => {
      expect(currentUrlIndex).to.equal(1);
      expect(currentUrl).to.equal(EXAMPLE_URL_TWO);
    })
    .then(() => {
      return eventCallbacks['loop-iteration']();
    })
    .then((value) => {
      expect(currentUrlIndex).to.equal(0);
      expect(currentUrl).to.equal(EXAMPLE_URL);
    });
  });
});
