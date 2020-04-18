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
- Misc fixes and improvements to the documentation.
