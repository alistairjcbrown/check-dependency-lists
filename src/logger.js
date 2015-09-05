import _ from 'underscore';

const log = (data, opts) => {
  let output = data;

  if (_.isObject(opts) && opts.pretty === true) {
    output = JSON.stringify(output, null, 4);
  }

  console.log(output);
};

const error = (...args) => {
  log.apply(null, args);
};

const warning = (...args) => {
  log.apply(null, args);
};

export default { error, warning };
