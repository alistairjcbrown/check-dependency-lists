'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _utils = require('./utils');

var getMissingDepdencies = function getMissingDepdencies(dependencies) {
  return _underscore2['default'].reduce(dependencies, function (missing, dependency) {
    if (!_underscore2['default'].every(dependency.presence, _underscore2['default'].identity)) {
      missing.push(dependency);
    }
    return missing;
  }, []);
};

var getNonSemVerDepdencies = function getNonSemVerDepdencies(dependencies) {
  return _underscore2['default'].reduce(dependencies, function (nonSemVer, dependency) {
    var packagejson = dependency.version.packagejson;

    if (packagejson !== null && !_semver2['default'].satisfies('0.0.0', '0 || ' + packagejson)) {
      nonSemVer.push(dependency);
    }
    return nonSemVer;
  }, []);
};

var getBadVersionDependencies = function getBadVersionDependencies(dependencies) {
  var missing = getMissingDepdencies(dependencies);
  var nonSemVer = getNonSemVerDepdencies(dependencies);
  var validDependencies = _underscore2['default'].difference(dependencies, missing, nonSemVer);

  return _underscore2['default'].reduce(validDependencies, function (badVersions, dependency) {
    var _dependency$version = dependency.version;
    var packagejson = _dependency$version.packagejson;
    var installed = _dependency$version.installed;
    var npmshrinkwrap = _dependency$version.npmshrinkwrap;

    if (!_semver2['default'].satisfies(installed, packagejson) || !_semver2['default'].satisfies(npmshrinkwrap, packagejson)) {
      badVersions.push(dependency);
    }
    return badVersions;
  }, []);
};

var checkDependencyLists = function checkDependencyLists(opts, _ref) {
  var _ref2 = _slicedToArray(_ref, 3);

  var packagejson = _ref2[0];
  var npmshrinkwrap = _ref2[1];
  var installed = _ref2[2];

  var fail = false;

  var packagejsonDependencies = _underscore2['default'].extend({}, packagejson.dependencies, packagejson.devDependencies);
  var npmshrinkwrapDependencies = (0, _utils.flattenDependencySource)(npmshrinkwrap);
  var installedDependencies = (0, _utils.flattenDependencySource)(installed);
  var dependencyList = (0, _utils.generateDependencyList)([packagejsonDependencies, npmshrinkwrapDependencies, installedDependencies]);

  var missing = getMissingDepdencies(dependencyList);
  if (missing.length > 0) {
    _logger2['default'].error('There are dependencies which are not present in all dependency lists');
    _logger2['default'].error(missing, { pretty: true });
    fail = true;
  }

  var nonSemVer = getNonSemVerDepdencies(dependencyList);
  if (nonSemVer.length > 0) {
    _logger2['default'].warning('WARNING: There are dependencies which do not have valid semantic versioning');
    _logger2['default'].warning(_underscore2['default'].pluck(nonSemVer, 'name').join(', '));
  }

  var badVersion = getBadVersionDependencies(dependencyList);
  if (badVersion.length > 0) {
    _logger2['default'].error('There are dependencies which do not satisfy the version range set in the "package.json" file');
    _logger2['default'].error(badVersion, { pretty: true });
    fail = true;
  }

  if (fail) {
    var error = new Error('Dependency check failed');
    if (_underscore2['default'].isFunction(opts.callback)) {
      return opts.callback(error);
    }

    throw error;
  }

  if (_underscore2['default'].isFunction(opts.callback)) {
    return opts.callback();
  }
};

exports['default'] = function () {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var rootPath = opts.rootDir || '.';

  if (rootPath.slice(-1) === '/') {
    rootPath = rootPath.slice(0, -1);
  }
  rootPath = process.cwd() + '/' + rootPath;

  _promise2['default'].all([(0, _utils.requireFile)(rootPath + '/package.json'), (0, _utils.requireFile)(rootPath + '/npm-shrinkwrap.json'), (0, _utils.npmListDependencies)()]).then(_underscore2['default'].partial(checkDependencyLists, opts))['catch'](function (err) {
    _logger2['default'].error(err);
    process.exit(1);
  });
};

module.exports = exports['default'];