## [3.2.1] - 2021-10-05

### Changed

- Update dependencies

## [3.2.0] - 2021-09-15

### Fixed

- Fixed type declarations

## [3.1.1] - 2021-09-11

### Changed

- Don't include source files in the NPM package
- Updated dependencies

## [3.1.0] - 2021-09-09

### Changed

- Switched from tsdx to dts-cli, because the former is no longer actively maintained
- Updated dependencies

## [3.0.1] - 2021-06-14

### Changed

- Update dependencies to fix dependabot alerts

## [3.0.0] - 2021-05-05

### Added

- Added a new plugin to connect to the Redux DevTools.

### Changed

- Minor tweaks to the documentation.
- Completely overhauled typescript's types. Hopefully they are much better now.
- Updated various dependencies, like typescript and tslib.
- Converted tests from javascript to typescript.

## [3.0.0-beta.1] - 2021-04-29

### Added

- Added a new plugin to connect to the Redux DevTools.

### Changed

- Minor tweaks to the documentation.

## [3.0.0-beta.0] - 2021-04-27

### Changed

- Completely overhauled typescript's types. Hopefully they are much better now.
- Updated various dependencies, like typescript and tslib.
- Converted tests from javascript to typescript.

## [2.1.1] - 2020-06-10

### Fixed

- There are no changes in this release, I just messed up with npm publish, so I need to bump version number...

## [2.1.0] - 2020-06-10

### Added

- The onBeforeUpdate function gets an extra parameter telling if the auto-save timer is active.

## [2.0.0] - 2020-06-04

### Changed

- Completely overhauled the plugin API. Extending the store should now be much easier.

## [1.0.4] - 2020-05-16

### Added

- Save immediately on unmount if there's an auto-save timer active.

### Fixed

- Don't trigger a render during onBeforeUpdate if the save function is not asynchronous.

## [1.0.3] - 2020-05-14

### Fixed

- Fix reducer setup which was run too late under certain circumstances.

## [1.0.2] - 2020-05-14

### Fixed

- Fixed documentation on how to use the container.

## [1.0.1] - 2020-05-11

### Fixed

- Fixed auto-save after container unmount

## [1.0.0] - 2020-04-25

We are probably ready for our debut, so let's bump the version number to 1.0.0!

## [0.4.4] - 2020-04-24

### Changed

- Pass `children` to the wrapped Component.

### Fixed

- Fixed a link in the documentation.

## [0.4.3] - 2020-04-22

### Changed

- Just tried to refine the module a bit.

### Added

- A couple more unit tests.

## [0.4.2] - 2020-04-18

### Added

- First draft for the documentation about extending the store. Still missing a working demo, but I think it was delayed enough.

## [0.4.1] - 2020-04-16

### Changed

- Allow to set 0 as the delay for auto-save.

### Fixed

- Fixed an edge case for auto-save with onBeforeUpdate().

## [0.4.0] - 2020-04-15

### Changed

- withUndoRedo: Replaced the option `stateKey` with `getState` / `setState`. This should improve decoupling from the state implementation.
- Various fixes and improvements to the documentation.
