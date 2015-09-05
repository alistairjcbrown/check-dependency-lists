import _ from 'underscore';
import npm from 'npm';
import Promise from 'promise';

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

const npmListDependencies = () => {
  return new Promise((resolve, reject) => {
    npm.load({}, function (loadErr) {
      if (loadErr) {
        return reject(loadErr);
      }
      npm.commands.ls([], true, function(lsErr, project, value) {
        if (lsErr) {
          return reject(lsErr);
        }
        resolve(value);
      });
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
  requireFile, npmListDependencies,
  flattenDependencySource,
  generateDependencyObject, generateDependencyList
};
