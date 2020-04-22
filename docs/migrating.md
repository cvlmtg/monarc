# Migrating from Flux

One of the goals of MONARC was to ease the migration from Flux to a more modern and maintained solution to manage an application state. That means you should be able to migrate your existing applications without too much effort or extensive rewrites.

These instructions should help you migrating from a Flux application using the [ReduceStore / Container](https://facebook.github.io/flux/docs/flux-utils) pattern with actions dispatched through Flux's [Dispatcher](https://facebook.github.io/flux/docs/dispatcher).

## Dispatcher

First we need to replace Flux's dispatcher with a new one. Usually the dispatcher is put in a separate module, which is then imported and used by the various action creators and to setup the store. All we need to do is to replace it with a fake one.

*before*
```js
import { Dispatcher } from 'flux';
export default new Dispatcher();
```

*after*
```js
export default { dispatch: null };
```

The `dispatch` attribute will later be replaced by the real dispatch function.

**CAVEATS**

- Because of how React hooks work, our fake `dispatch` method will remain *null* until the first render. If your application fires some actions before that, you'll need some refactoring (but usually a spinner or a progress bar will be enough).
- The only method supported is `dispatch`. Other methods from Flux's dispatcher are not supported (e.g. `isDispatching`), but if you have followed the `ReduceStore` / `Container` pattern, you have probably never used them.

## Action creators

We should not need to make any changes to our existing action creators.

*before*
```js
import dispatcher from './dispatcher';

export function increment(qty) {
  dispatcher.dispatch({ type: 'INCREMENT', qty });
}
```

*after*
```js
import dispatcher from './dispatcher';

export function increment(qty) {
  dispatcher.dispatch({ type: 'INCREMENT', qty });
}
```

## Store

The store is now set up in the container, since React's hooks and context are tied to the components. This means that our existing stores can be deleted. This is assuming we have a store which simply subscribes to the dispatcher and that our reducers are neatly organized in one or more separate files. Here is an example of such a basic store:

```js
import { ReduceStore } from 'flux/utils';
import reduce from './counter-reducer';
import dispatcher from './dispatcher';

class CounterStore extends ReduceStore {
  getInitialState() {
    return 0;
  }

  reduce(state, action) {
    return reduce(state, action);
  }
}

export default new CounterStore(dispatcher);
```

## Reducers

We should not need to make any changes to our existing reducers.

*before*
```js
export default function reduce(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
```

*after*
```js
export default function reduce(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
```

## Container

The store is now set up in the container. To mimic the Flux pattern, where the container updates its state when the store changes and then passes it down to its children, our new container will be rendered with a `store` prop which contains the store current state. Please note that in the `createContainer` function call we now have to pass the dispatcher as well.

*before*
```jsx
import CounterStore from './counter-store';
import { Container } from 'flux/utils';
import { Component } from 'react';

class CounterContainer extends Component {
  static getStores() {
    return [ CounterStore ];
  }

  static calculateState(prevState) {
    return {
      counter: CounterStore.getState()
    };
  }

  render() {
    return (
      <CounterUI counter={this.state.counter} />
    );
  }
}

const container = Container.create(CounterContainer);
```

*after*
```jsx
import counterReducer from './counter-reducer';
import { createContainer } from 'monarc';
import dispatcher from './dispatcher';

function CounterContainer({ store }) {
  return (
    <CounterUI counter={store} />
  );
}

CounterContainer.propTypes = {
  store: PropTypes.object.isRequired
};

const container = createContainer(CounterContainer, counterReducer, dispatcher);
```

---

[Back to the index](../README.md)
