# check-dependency-lists

Check dependency lists are all in sync. This script checks the `package.json` file against both the installed dependencies and the `npm-shrinkwrap.json` file to make sure that they are all in sync and that all dependencies match the expected version ranges.

## Options

The function takes an options object which can contain

 - `rootDir` - a relative path to the roo of the project; this should be the location of your `package.json` and `npm-shrinkwrap.json` files.

## Example

The check can be run using the example directory.

For example, if `lodash` were installed without being saved to the `package.json` file or shrinkwrapped, the following output would be produced.

```shell
> $ node example

There are dependencies which are not present in all dependency lists
[
    {
        "name": "lodash",
        "presence": {
            "packagejson": false,
            "npmshrinkwrap": false,
            "installed": true
        },
        "version": {
            "packagejson": null,
            "npmshrinkwrap": null,
            "installed": "3.10.1"
        }
    }
]
[Error: Dependency check failed]
```

## Adding as a linting task

This check can been added as part of your build or linting tasks to cause a failure when dependencies are not in sync.

```js
var checkDependencyLists = require('check-dependency-lists');

gulp.task('dependency-lint', function() {
  return checkDependencyLists({
    rootDir: '../'
  });
});
```
