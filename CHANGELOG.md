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
