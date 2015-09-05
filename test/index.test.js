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
  error: sinon.stub(),
  warning: sinon.stub()
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
    mockedLogger.warning.reset();
  });

  it('should exist', function() {
    expect(env.checkDependencyLists).to.be.a('function');
  });

  describe('error conditions', function() {
    let errorStates = {
      'install-mismatch': 'has only been installed',
      'package-mismatch': 'has only been saved to package.json',
      'shrinkwrap-mismatch': 'has only been saved to npm-shrinkwrap.json',
      'version-mismatch': 'has a version which differes from the package.json'
    };

    _.each(errorStates, (description, mismatchType) => {
      describe(`when a dependency ${description}`, function() {
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

        it('should output error with dependency details', function() {
          expect(mockedLogger.error).to.have.callCount(2);
          expect(mockedLogger.error.getCall(1).args[0][0]).to.deep.equal(env.expectedOutput);
        });

        it('should provide an error to the callback', function() {
          expect(env.error).to.be.an.instanceof(Error);
        });
      });
    });
  });

  describe('warning conditions', function() {
    let warningStates = {
      'invalid-version': 'does not have a valid semantic version'
    };

    _.each(warningStates, (description, mismatchType) => {
      describe(`when a dependency ${description}`, function() {
        beforeEach(function(done) {
          env.installed = require(`./fixtures/${mismatchType}/installed.json`);
          env.expectedOutput = require(`./fixtures/${mismatchType}/output.json`);
          env.checkDependencyLists({
            rootDir: `test/fixtures/${mismatchType}`,
            callback: done
          });
        });

        it('should output warning with dependency details', function() {
          expect(mockedLogger.warning).to.have.callCount(2);
          expect(mockedLogger.warning.getCall(1).args[0]).to.equal(env.expectedOutput);
        });
      });
    });
  });

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
