# Extending the store

MONARC can be extend with you own plugins, in the same manner the built-in `withUndoRedo` and `withAutoSave` extend the core functionality.

A plugin is built of two parts. The first one wraps the reducer, the second one (optional) is a React component that will be rendered to provide a new context for the application.

## A simple example

Let's suppose we want to collect some data to analyze how our users uses the application. We could log certain events depending on the actions being fired or its parameters. In this case we don't need to add a new context for the application, so we'll build just the wrapper for the reducer.

*with-analytics.js*

```js
 1  function wrapReducer(reduce, ctx, options) {
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

The `wrapReducer` function receives a reducer and the options we pass when invoking our `withAnalytics` plugin. Then it returns another reducer which will do all the logging (*line 4*). Like any other reducer, it must return the new state, so we can just invoke the child reducer (*line 13*).

Now we need to write our plugin function.

```js
 1  import { createPlugin } from 'monarc';
 2
 3  function wrapReducer(reduce, ctx, options) {
 4    ...
 5  }
 6
 7  const { withPlugin } = createPlugin({ wrapReducer });
 8
 9 export { withPlugin as withAnalytics };
```

We just need to call `createPlugin` passing our `wrapReducer` function (*line 7*) and then we are ready to export our plugin with the name we like (*line 9*). Our plugin is ready to be used in our application.

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
 9    const store = useStore();
10
11    return (
12      <div>
13        <Header user={store.user} />
14        <Application />
15      </div>
16    );
17  }
18
19  export default createContainer(CounterContainer, reducer);
```

## A full fledged plugin

Suppose that now we want to display the number of actions logged. We need to create a context provider, so that another component of our application can read it and display it in the right place. We don't need to manually create it, we just need a hook that will return the correct value.

```jsx
 1  function useValue(ctx) {
 4    return ctx.actionsLogged;
 5  }
 6
 7  const ctx = {
 8    actionsLogged;: 0
 9  };
```

We create an object (*line 7*) that will get passed to our hook and to our reducer (*line 1*). Now we need a way to increment our counter every time we process an action.

```jsx
 1  function wrapReducer(reduce, ctx, options) {
 2    const url = options.endpointUrl;
 3
 4    ctx.actionsLogged; += 1;
 5
 6    return function analytics(state, action) {
 7      fetch(url, {
 8        body:    JSON.stringify(action),
 9        method:  'POST',
10        headers: {
11          'Content-Type': 'application/json'
12        }
13      });
14
15      return reduce(state, action);
16    }
17  }
18
19  ...
20
21  const { withPlugin, usePlugin, context } = createPlugin({
22    wrapReducer,
23    useValue,
24    ctx
25  });
26
27  export {
28    withPlugin as withAnalytics,
30    usePlugin as useAnalytics,
29    context as analyticsContext
31  };
```
In our reducer we will increment our counter (*line 4*). Now we only need to export the hook to read the value (which we will rename to `useAnalytics`, *line 30*) and the context to be used by class based components (*line 29*).

---

[Back to the index](../README.md)
