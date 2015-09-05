'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var log = function log(data, opts) {
  var output = data;

  if (_underscore2['default'].isObject(opts) && opts.pretty === true) {
    output = JSON.stringify(output, null, 4);
  }

  console.log(output);
};

var error = function error() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  log.apply(null, args);
};

var warning = function warning() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  log.apply(null, args);
};

exports['default'] = { error: error, warning: warning };
module.exports = exports['default'];