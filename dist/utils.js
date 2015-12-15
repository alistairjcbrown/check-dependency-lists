'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _npm = require('npm');

var _npm2 = _interopRequireDefault(_npm);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var requireFile = function requireFile(path) {
  return new _promise2['default'](function (resolve, reject) {
    try {
      var value = require(path);
      resolve(value);
    } catch (e) {
      reject(e);
    }
  });
};

var npmListDependencies = function npmListDependencies() {
  return new _promise2['default'](function (resolve, reject) {
    _npm2['default'].load({}, function (loadErr) {
      if (loadErr) {
        return reject(loadErr);
      }
      _npm2['default'].commands.ls([], true, function (lsErr, project, value) {
        if (lsErr) {
          return reject(lsErr);
        }
        resolve(value);
      });
    });
  });
};

var flattenDependencySource = function flattenDependencySource(source) {
  return _underscore2['default'].reduce(source.dependencies, function (dependencies, data, name) {
    dependencies[name] = data.version;
    return dependencies;
  }, {});
};

var generateDependencyObject = function generateDependencyObject(dependencySources, name) {
  var _dependencySources = _slicedToArray(dependencySources, 3);

  var packagejsonDependencies = _dependencySources[0];
  var npmshrinkwrapDependencies = _dependencySources[1];
  var installedDependencies = _dependencySources[2];

  return {
    name: name,
    presence: {
      packagejson: !!packagejsonDependencies[name],
      npmshrinkwrap: !!npmshrinkwrapDependencies[name],
      installed: !!installedDependencies[name]
    },
    version: {
      packagejson: packagejsonDependencies[name] || null,
      npmshrinkwrap: npmshrinkwrapDependencies[name] || null,
      installed: installedDependencies[name] || null
    }
  };
};

var generateDependencyList = function generateDependencyList(dependencySources) {
  var _dependencySources2 = _slicedToArray(dependencySources, 3);

  var packagejsonDependencies = _dependencySources2[0];
  var npmshrinkwrapDependencies = _dependencySources2[1];
  var installedDependencies = _dependencySources2[2];

  var packagejsonDependenciesList = _underscore2['default'].keys(packagejsonDependencies);
  var npmshrinkwrapDependenciesList = _underscore2['default'].keys(npmshrinkwrapDependencies);
  var installedDependenciesList = _underscore2['default'].keys(installedDependencies);

  var dependencies = _underscore2['default'].map(packagejsonDependenciesList, _underscore2['default'].partial(generateDependencyObject, dependencySources));

  var npmshrinkwrapSpecificDependencies = _underscore2['default'].difference(npmshrinkwrapDependenciesList, packagejsonDependenciesList);
  dependencies = dependencies.concat(_underscore2['default'].map(npmshrinkwrapSpecificDependencies, _underscore2['default'].partial(generateDependencyObject, dependencySources)));

  var installedSpecificDependencies = _underscore2['default'].difference(packagejsonDependenciesList, installedDependenciesList);
  dependencies = dependencies.concat(_underscore2['default'].map(installedSpecificDependencies, _underscore2['default'].partial(generateDependencyObject, dependencySources)));

  dependencies = _underscore2['default'].sortBy(dependencies, 'name');
  return _underscore2['default'].uniq(dependencies, true, function (dependency) {
    return dependency.name;
  });
};

exports['default'] = {
  requireFile: requireFile, npmListDependencies: npmListDependencies,
  flattenDependencySource: flattenDependencySource,
  generateDependencyObject: generateDependencyObject, generateDependencyList: generateDependencyList
};
module.exports = exports['default'];