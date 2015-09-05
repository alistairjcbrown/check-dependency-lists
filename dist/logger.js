'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var error = function error(data, opts) {
  var output = data;

  if (_underscore2['default'].isObject(opts) && opts.pretty === true) {
    output = JSON.stringify(output, null, 4);
  }

  console.log(output);
};

exports['default'] = { error: error };
module.exports = exports['default'];