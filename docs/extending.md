# Extending the store

MONARC can be extended with your own plugins, in the same manner the built-in `withUndoRedo` and `withAutoSave` extend the core functionality.

A plugin consists of two parts: the first one extends the store's reducer, the second one is an (optional) React component that will be rendered to provide a new context for the application.

A plugin is created with the `createPlugin` function.

## Syntax

```js
const [ plugin ] = createPlugin(wrapReducer[, defaults]);
const [ plugin, hook, context ] = createPlugin(wrapReducer, contextValue[, defaults]);
```

### Parameters

* `wrapReducer`

  This is a function that is used to extend a reducer and returns another reducer.

* `contextValue` (optional)

  This is an optional function (or React hook) that is called to calculate the value of the plugin context on each render.

* `defaults` (optional)

  A plugin can accept some options, so if we want to have some default values, we can pass them to the `createPlugin` function as the last argument.

### Return value

An array containing our plugin and, if we supplied the `contextValue` hook, an hook that may be used by functional components to read the plugin context value (like the built-in `useAutoSave` or `useUndoRedo` hooks), plus the plugin's context for class based components (please refer to the [React documentation](https://en.reactjs.org/docs/context.html#classcontexttype) for more information).

## A simple example

Let's suppose we want to collect some data to analyze how our users uses the application. We could log certain events depending on the actions being fired or their parameters. In this case we don't need to add a new context for the application, so we'll build just the wrapper for the reducer.

*with-analytics.js*

```js
 1  function wrapReducer(reduce, ps, options) {
 2    const url = options.endpointUrl;
 3
 4    return function analytics(state, action) {
 5      fetch(url, {
 6        body:    JSON.stringify(action),
 7        method:  'POST',
 8        headers: {
 9          'Content-Type': 'application/json'
10        }
11      });
12
13      return reduce(state, action);
14    }
15  }
```

The `wrapReducer` function receives a reducer and the options we pass when invoking our `withAnalytics` plugin (already merged with their default values, if any). Then it returns another reducer which will do all the logging (*line 4*). Like any other reducer, it must return the new state, so we can just invoke the child reducer (*line 13*).

Now we need to write our plugin function.

```js
 1  import { createPlugin } from 'monarc';
 2
 3  function wrapReducer(reduce, ps, options) {
 4    ...
 5  }
 6
 7  const [ withAnalytics ] = createPlugin(wrapReducer);
 8
 9  export { withAnalytics };
```

We just need to call `createPlugin` passing our `wrapReducer` function (*line 7*) and then we are ready to export our plugin, which we have called `withAnalytics` (*line 9*). Our plugin is ready to be used in our application.

*container.jsx*

```jsx
 1  import { createContainer, useStore } from 'monarc';
 2  import { withAnalytics } from './with-analytics';
 3  import counterReducer from './counter-reducer';
 4
 5  const options = { endpointUrl: 'https://example.com/etc...' };
 6  const reducer = withAnalytics(counterReducer, options);
 7
 8  function CounterContainer() {
 9    const { user } = useStore();
10
11    return (
12      <div>
13        <Header user={user} />
14        <Application />
15      </div>
16    );
17  }
18
19  export default createContainer(CounterContainer, reducer);
```

## A full fledged plugin

Suppose that now we want to display the number of actions logged. We need to create a context provider, so that another component of our application can read it and display it in the right place. We don't need to manually create it, we just need a function or React hook that will return the correct value.

```jsx
 1  function contextValue(ps) {
 2    return ps.actionsLogged;
 3  }
```

We can now increment the `actionsLogged` value in our reducer.

```jsx
 1  function wrapReducer(reduce, ps, options) {
 2    const url = options.endpointUrl;
 3
 4    ps.actionsLogged = 0;
 5
 6    return function analytics(state, action) {
 7      ps.actionsLogged += 1;
 8
 9      fetch(url, {
10        body:    JSON.stringify(action),
11        method:  'POST',
12        headers: {
13          'Content-Type': 'application/json'
14        }
15      });
16
17      return reduce(state, action);
18    }
19  }
20
21  ...
22
23  const [ withAnalytics, useAnalytics, analyticsContext ] = createPlugin(wrapReducer, contextValue);
24
25  export { withAnalytics, useAnalytics, analyticsContext };
```

We initialize our `ps` object (*line 4*) that is passed to our hook and to our reducer. Then we increment our counter every time we process an action (*line 7*). The last step is to export the hook (which we have called `useAnalytics`) to read the context value, and the context needed by class based components (*line 23*).

---

[Back to the index](../README.md)
