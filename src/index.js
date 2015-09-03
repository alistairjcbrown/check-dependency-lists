import _ from 'underscore';
import semver from 'semver';
import {
  requireFile, runCommand,
  flattenDependencySource,
  generateDependencyList
} from './utils';

const getMissingDepdencies = (dependencies) => {
  return _.reduce(dependencies, (missing, dependency) => {
    if (!_.every(dependency.presence, _.identity)) {
      missing.push(dependency);
    }
    return missing;
  }, []);
};

const getBadVersionDependencies = (dependencies) => {
  const missing = getMissingDepdencies(dependencies);
  const validDependencies = _.difference(dependencies, missing);

  return _.reduce(validDependencies, (badVersions, dependency) => {
    const { version: { packagejson, installed, npmshrinkwrap } } = dependency;
    if (!semver.satisfies(installed, packagejson) || !semver.satisfies(npmshrinkwrap, packagejson)) {
      badVersions.push(dependency);
    }
    return badVersions;
  }, []);
};

const checkDependencyLists = ([ packagejson, npmshrinkwrap, installed ]) => {
  const packagejsonDependencies = _.extend({}, packagejson.dependencies, packagejson.devDependencies);
  const npmshrinkwrapDependencies = flattenDependencySource(npmshrinkwrap);
  const installedDependencies = flattenDependencySource(installed);
  const dependencyList = generateDependencyList([ packagejsonDependencies, npmshrinkwrapDependencies, installedDependencies ]);

  const missing = getMissingDepdencies(dependencyList);
  if (missing.length > 0) {
    console.log('There are dependencies which are not present in all sources');
    console.log(JSON.stringify(missing, null, 4));
  }

  const badVersion = getBadVersionDependencies(dependencyList);
  if (badVersion.length > 0) {
    console.log('There are dependencies which do not satisfy the version range in packagejson.json');
    console.log(JSON.stringify(badVersion, null, 4));
  }
};

export default ({ rootDir }) => {
  let rootPath = rootDir || '.';

  if (rootPath.endsWith('/')) {
    rootPath = rootPath.slice(0, -1);
  }

  Promise.all([
    requireFile(`${rootPath}/package.json`),
    requireFile(`${rootPath}/npm-shrinkwrap.json`),
    runCommand('npm ls --depth=0 --json')
  ]).then(checkDependencyLists).catch((err) => {
    console.log(err);
    throw new Error(err);
  });
};
