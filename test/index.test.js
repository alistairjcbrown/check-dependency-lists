/* global beforeEach, afterEach, describe, it */
import _ from 'underscore';
import proxyquire from 'proxyquire';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const { expect } = chai;
chai.use(sinonChai);

let env = null;
const mockedNpm = {
  load(config, callback) {
    callback();
  },
  commands: {
    ls(options, silent, callback) {
      callback(null, {}, env.installed);
    }
  }
};
const mockedLogger = {
  error: sinon.stub()
};

describe('Check Dependency Lists', function() {
  beforeEach(function() {
    env = {};
    proxyquire('../src/utils', { npm: mockedNpm });
    env.checkDependencyLists = proxyquire('../src', {
      './logger': mockedLogger
    });
  });

  afterEach(function() {
    mockedLogger.error.reset();
  });

  it('should exist', function() {
    expect(env.checkDependencyLists).to.be.a('function');
  });

  describe('error conditions', function() {
    let errorStates = {
      'install-mismatch': 'only been installed',
      'package-mismatch': 'only been saved to package.json',
      'shrinkwrap-mismatch': 'only been saved to npm-shrinkwrap.json',
      'version-mismatch': 'a version which differes from the package.json'
    };

    _.each(errorStates, (description, mismatchType) => {
      describe(`when a dependency has ${description}`, function() {
        beforeEach(function(done) {
          env.installed = require(`./fixtures/${mismatchType}/installed.json`);
          env.expectedOutput = require(`./fixtures/${mismatchType}/output.json`);
          env.checkDependencyLists({
            rootDir: `test/fixtures/${mismatchType}`,
            callback: (err) => {
              env.error = err;
              done();
            }
          });
        });

        it('should output mismatched dependency details', function() {
          expect(mockedLogger.error).to.have.callCount(2);
          expect(mockedLogger.error.getCall(1).args[0][0]).to.deep.equal(env.expectedOutput);
        });

        it('should provide an error to the callback', function() {
          expect(env.error).to.be.an.instanceof(Error);
        });
      });
    });
  });

  // describe('error conditions', function() {
  //   describe('when a dependency does not have a valid semantic version', function() {
  //     it('should output a warning');
  //   });
  // });

  describe('success condition', function() {
    describe('when there are no dependency mismatches', function() {
      beforeEach(function(done) {
        env.installed = require('./fixtures/no-mismatch/installed.json');
        env.checkDependencyLists({
          rootDir: 'test/fixtures/no-mismatch',
          callback: done
        });
      });

      it('should output nothing', function() {
        expect(mockedLogger.error).to.have.callCount(0);
      });
    });
  });

  describe('when a callback is not provided as an option', function() {
    beforeEach(function() {
      sinon.stub(process, 'exit');
    });

    afterEach(function() {
      process.exit.restore();
    });

    describe('when there is a dependency mismatch', function() {
      beforeEach(function() {
        env.installed = require('./fixtures/package-mismatch/installed.json');
      });

      it('should exit the process with an error code', function(done) {
        env.checkDependencyLists({
          rootDir: 'test/fixtures/package-mismatch',
        });

        _.defer(() => {
          expect(process.exit).to.have.callCount(1);
          done();
        });
      });
    });

    describe('when there are no dependency mismatches', function() {
      beforeEach(function() {
        env.installed = require('./fixtures/no-mismatch/installed.json');
      });

      it('should not exit the process', function(done) {
        env.checkDependencyLists({
          rootDir: 'test/fixtures/no-mismatch',
        });

        _.defer(() => {
          expect(process.exit).to.have.callCount(0);
          done();
        });
      });
    });
  });
});
