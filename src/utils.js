import { exec } from 'child_process';
import Promise from 'promise';
import _ from 'underscore';

const requireFile = (path) => {
  return new Promise((resolve, reject) => {
    try {
      const value = require(path);
      resolve(value);
    } catch(e) {
      reject(e);
    }
  });
};

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      try {
        const value = JSON.parse(stdout);
        resolve(value);
      } catch(e) {
        reject(e);
      }
    });
  });
};

const flattenDependencySource = (source) => {
  return _.reduce(source.dependencies, (dependencies, data, name) => {
    dependencies[name] = data.version;
    return dependencies;
  }, {});
};

const generateDependencyObject = (dependencySources, name) => {
  const [ packagejsonDependencies, npmshrinkwrapDependencies, installedDependencies ] = dependencySources;
  return {
    name,
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

const generateDependencyList = (dependencySources) => {
  const [ packagejsonDependencies, npmshrinkwrapDependencies, installedDependencies ] = dependencySources;
  const packagejsonDependenciesList = _.keys(packagejsonDependencies);
  const npmshrinkwrapDependenciesList = _.keys(npmshrinkwrapDependencies);
  const installedDependenciesList = _.keys(installedDependencies);

  let dependencies = _.map(packagejsonDependenciesList, _.partial(generateDependencyObject, dependencySources));

  const npmshrinkwrapSpecificDependencies = _.difference(npmshrinkwrapDependenciesList, packagejsonDependenciesList);
  dependencies = dependencies.concat(_.map(npmshrinkwrapSpecificDependencies, _.partial(generateDependencyObject, dependencySources)));

  const installedSpecificDependencies = _.difference(installedDependenciesList, packagejsonDependenciesList);
  dependencies = dependencies.concat(_.map(installedSpecificDependencies, _.partial(generateDependencyObject, dependencySources)));

  dependencies = _.sortBy(dependencies, 'name');
  return _.uniq(dependencies, true, (dependency) => dependency.name);
};

export default {
  requireFile, runCommand,
  flattenDependencySource,
  generateDependencyObject, generateDependencyList
};
