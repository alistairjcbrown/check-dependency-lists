/* global beforeEach, describe, it */
import checkDependencyLists from '../';

const { expect } = require('chai');
let env = null;

beforeEach(function() {
  env = {};
});

describe('Check Dependency Lists', function() {
  it('should exist', function() {
    expect(checkDependencyLists).to.be.a('function');
  });

  it('should return dependency details when a dependency has only been installed');

  it('should return dependency details when a dependency has only been saved to package.json');

  it('should return dependency details when a dependency has only been saved to npm-shrinkwrap.json');

  it('should return empty when there are no dependency mismatches');

  describe('when dependency does not have a valid semantic version', function() {
    it('should return a warning');
  });
});
