const expect = require('chai').expect;
const sinon = require('sinon');

const LoopBehavior = require('../../src/node/models/loop-behavior');

describe('LoopBehavior', function() {
  let sinonClock = null;

  before(function() {
    sinonClock = sinon.useFakeTimers(Date.now());
  });

  after(function() {
    sinonClock.restore();
  });

  it('should throw is speed is not set', function() {
    const loopBehavior = new LoopBehavior();
    expect(() => {
      loopBehavior.startLoop();
    }).to.throw('LoopBehavior.startLoop() called before the speed was set.');
  });

  it('should throw if invalid value type set for duration', function() {
    const loopBehavior = new LoopBehavior();
    expect(() => {
      loopBehavior.changeSpeedSecs({});
    }).to.throw('LoopBehavior.changeSpeed() expected a number greater than zero.');
  });

  it('should throw if zero used to set duration', function() {
    const loopBehavior = new LoopBehavior();
    expect(() => {
      loopBehavior.changeSpeedSecs(0);
    }).to.throw('LoopBehavior.changeSpeed() expected a number greater than zero.');
  });

  it('should emit loop-iteration event for time', function() {
    const loopBehavior = new LoopBehavior();
    loopBehavior.changeSpeedSecs(10);

    let numberOfTimesFired = 0;
    loopBehavior.on('loop-iteration', () => {
      numberOfTimesFired++;
    });

    loopBehavior.startLoop();

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(1);

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(2);

    sinonClock.tick(8 * 1000);
    expect(numberOfTimesFired).to.equal(2);

    sinonClock.tick(2 * 1000);
    expect(numberOfTimesFired).to.equal(3);

    loopBehavior.changeSpeedSecs(2);
    expect(numberOfTimesFired).to.equal(3);

    sinonClock.tick(2 * 1000);
    expect(numberOfTimesFired).to.equal(4);
  });

  it('should stop emitting loop-iteration event after stioLooping', function() {
    const loopBehavior = new LoopBehavior();
    loopBehavior.changeSpeedSecs(10);

    let numberOfTimesFired = 0;
    loopBehavior.on('loop-iteration', () => {
      numberOfTimesFired++;
    });

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(0);

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(0);

    loopBehavior.startLoop();

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(1);

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(2);

    loopBehavior.stopLoop();

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(2);

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(2);

    loopBehavior.startLoop();

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(3);

    sinonClock.tick(10 * 1000);
    expect(numberOfTimesFired).to.equal(4);
  });
});
