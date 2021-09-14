# MONARC 🦋

MONARC's Obviously Not A Redux Clone.

MONARC is a store intended for [React](https://reactjs.org/) applications, based on the new [Context](https://en.reactjs.org/docs/context.html) API and [useContext / useReducer](https://en.reactjs.org/docs/hooks-reference.html#usecontext) hooks.

It can be extended with your own plugins, with a couple included to provide two advanced features: **undo** / **redo** management and **auto-save**. There is also a plugin to connect your application to the [Redux DevTools](https://github.com/reduxjs/redux-devtools). All of these features can be enabled on demand.

MONARC also provides some features to help migrating applications using the [Flux](https://facebook.github.io/flux/) `ReduceStore` / `Container` pattern, so you won't have to rewrite your application from scratch.

[![npm version](https://img.shields.io/npm/v/monarc.svg?style=flat-square)](https://www.npmjs.com/package/monarc)
[![npm downloads](https://img.shields.io/npm/dm/monarc.svg?style=flat-square)](https://www.npmjs.com/package/monarc)

## Installation

MONARC is available as a package on NPM for use with a module bundler.

```bash
# NPM
npm install monarc

# Yarn
yarn add monarc

```

## Motivation

This project was born as an alternative to Facebook's Flux state management. My company's React applications were based on Flux, which uses a deprecated React method that will stop working sooner or later. Since Flux seems no longer actively maintained, it is probably wise to start thinking about an escape path before it's too late.

MONARC has already successfully replaced Flux and is being used in production on old and new applications.

## Documentation

* [Usage](docs/usage.md)
  * [Reducer](docs/usage.md#reducer)
  * [Undo / Redo](docs/usage.md#withundoredo)
  * [Auto-save](docs/usage.md#withautosave)
  * [Container](docs/usage.md#container)
  * [Hooks](docs/usage.md#hooks)
* [Extending](docs/extending.md)
  * [A simple Example](docs/extending.md#a-simple-example)
  * [A full fledged plugin](docs/extending.md#a-full-fledged-plugin)
* [Migrating from Flux](docs/migrating.md)
  * [Dispatcher](docs/migrating.md#dispatcher)
  * [Action creators](docs/migrating.md#action-creators)
  * [Store](docs/migrating.md#dispatcher)
  * [Reducers](docs/migrating.md#reducers)
  * [Container](docs/migrating.md#container)

## TODO

- Improve documentation
- Add a demo application
- More tests!

## Licence

[MIT](LICENSE)
