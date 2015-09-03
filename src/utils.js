import { exec } from 'child_process';
import Promise from 'promise';
import _ from 'underscore';

var requireFile = (path) => {
  return new Promise((resolve, reject) => {
    try {
      var value = require(path);
      resolve(value);
    } catch(e) {
      reject(e);
    }
  });
};

var runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      try {
        var value = JSON.parse(stdout);
        resolve(value);
      } catch(e) {
        reject(e);
      }
    });
  });
};

var flattenDependencySource = (source) => {
  return _.reduce(source.dependencies, (dependencies, data, name) => {
    dependencies[name] = data.version;
    return dependencies;
  }, {});
};

var generateDependencyObject = (dependencySources, name) => {
  var [ packagejsonDependencies, npmshrinkwrapDependencies, installedDependencies ] = dependencySources;
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
  }
};

var generateDependencyList = (dependencySources) => {
  var [ packagejsonDependencies, npmshrinkwrapDependencies, installedDependencies ] = dependencySources;
  var packagejsonDependenciesList = _.keys(packagejsonDependencies);
  var npmshrinkwrapDependenciesList = _.keys(npmshrinkwrapDependencies);
  var installedDependenciesList = _.keys(installedDependencies);

  var dependencies = _.map(packagejsonDependenciesList, _.partial(generateDependencyObject, dependencySources));

  var npmshrinkwrapSpecificDependencies = _.difference(npmshrinkwrapDependenciesList, packagejsonDependenciesList);
  dependencies = dependencies.concat(_.map(npmshrinkwrapSpecificDependencies, _.partial(generateDependencyObject, dependencySources)));

  var installedSpecificDependencies = _.difference(installedDependenciesList, packagejsonDependenciesList);
  dependencies = dependencies.concat(_.map(installedSpecificDependencies, _.partial(generateDependencyObject, dependencySources)));

  dependencies = _.sortBy(dependencies, 'name');
  return _.uniq(dependencies, true, (dependency) => dependency.name);
};

export default {
  requireFile, runCommand,
  flattenDependencySource,
  generateDependencyObject, generateDependencyList
}
