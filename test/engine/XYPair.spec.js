import * as chai from  'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';

import XYPair from '../../src/engine/XYPair';

chai.should();
chai.use(sinonChai);

describe('XYPair', () => {
  var pair;

  beforeEach(() => {
    pair = new XYPair(5, 10);
  });

  describe('when constructing', () => {
    beforeEach(() => {
      sinon.stub(XYPair.prototype, 'set');
    });

    afterEach(() => {
      XYPair.prototype.set.restore();
    });

    it('should call set with both parameters', () => {
      pair = new XYPair(5, 10);

      pair.set.should.have.been.calledOnce;
      pair.set.should.have.been.calledWith(5, 10);
    });
  });

  describe('when setting', () => {
    it('should initialize with both passed points', () => {
      pair.x.should.equal(5);
      pair.y.should.equal(10);
    });

    it('should initialize with another point', () => {
      var pair2 = new XYPair(pair);

      pair2.x.should.equal(5);
      pair2.y.should.equal(10);
    });
  });

  describe('when checking equivalence', () => {
    it('should be equal when exactly the same', () => {
      var pair2 = new XYPair(5, 10);

      pair2.equals(pair).should.be.true;
    });

    it('should not be equal when not the same and outside of tolerance', () => {
      var pair2 = new XYPair(5.1, 10.1);

      pair2.equals(pair).should.not.be.true;
    });

    it('should be equal when inside default tolerance', () => {
      var pair2 = new XYPair(5.00001, 10.00001);

      pair2.equals(pair).should.be.true;
    });

    it('should be equal when inside specified tolerance', () => {
      var pair2 = new XYPair(5.01, 10.01);

      pair2.equals(pair, .1).should.be.true;
    });
  });
});
