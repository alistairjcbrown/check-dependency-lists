import _ from 'underscore';

const error = (data, opts) => {
  let output = data;

  if (_.isObject(opts) && opts.pretty === true) {
    output = JSON.stringify(output, null, 4);
  }

  console.log(output);
};

export default { error };
