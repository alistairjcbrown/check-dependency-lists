import _ from 'underscore';
import semver from 'semver';
import {
  requireFile, runCommand,
  flattenDependencySource,
  generateDependencyObject, generateDependencyList
} from './utils';

var getMissingDepdencies = (dependencies) => {
  return _.reduce(dependencies, function(missing, dependency) {
    if (!_.every(dependency.presence, _.identity)) {
      missing.push(dependency);
    }
    return missing;
  }, []);
};

var getBadVersionDependencies = (dependencies) => {
  var missing = getMissingDepdencies(dependencies);
  var validDependencies = _.difference(dependencies, missing);

  return _.reduce(validDependencies, function(badVersions, dependency) {
    var { version: { packagejson, installed, npmshrinkwrap } } = dependency;
    if (!semver.satisfies(installed, packagejson) || !semver.satisfies(npmshrinkwrap, packagejson)) {
      badVersions.push(dependency);
    }
    return badVersions;
  }, []);
};

var checkDependencyLists = ([ packagejson, npmshrinkwrap, installed ]) => {
  var packagejsonDependencies = _.extend({}, packagejson.dependencies, packagejson.devDependencies);
  var npmshrinkwrapDependencies = flattenDependencySource(npmshrinkwrap);
  var installedDependencies = flattenDependencySource(installed);

  var dependencyList = generateDependencyList([ packagejsonDependencies, npmshrinkwrapDependencies, installedDependencies ]);

  // -------------

  var missing = getMissingDepdencies(dependencyList);
  if (missing.length > 0) {
    console.log('There are dependencies which are not present in all sources');
    console.log(JSON.stringify(missing, null, 4));
  }

  // -------------

  var badVersion = getBadVersionDependencies(dependencyList);
  if (badVersion.length > 0) {
    console.log('There are dependencies which do not satisfy the version range in packagejson.json');
    console.log(JSON.stringify(badVersion, null, 4));
  }
};

export default function({ rootDir }) {
  rootDir = rootDir || '.';

  if (rootDir.endsWith('/')) {
    rootDir = rootDir.slice(0, -1);
  }

  Promise.all([
    requireFile(`${rootDir}/package.json`),
    requireFile(`${rootDir}/npm-shrinkwrap.json`),
    runCommand('npm ls --depth=0 --json')
  ]).then(checkDependencyLists).catch((err) => {
    console.log(err);
    throw new Error(err);
  });
};
