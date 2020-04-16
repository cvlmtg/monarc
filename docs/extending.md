# Extending the store

MONARC can be extend with you own plugins, in the same manner the built-in `withUndoRedo` and `withAutoSave` extends the core functionality.

A plugin is built of two parts. The first one wraps the reducer, the second one (optional) is a React component that will be rendered to provide a new context for the application.

## A simple example

Let's suppose we want to collect some data to analyze how our users uses the application. We could log certain events depending on the actions being fired or its parameters. In this case we don't need to add a new context for the application, so we'll build just the wrapper for the reducer.

*with-analytics.js*
```js
 1  import { splitReducer, assembleReducer} from 'monarc';
 2
 3  function wrapReducer(reduce, options) {
 4    const url = options.endpointUrl;
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
19  export function withAnalytics(maybeReducer, options) {
20    const [ reducer, Provider ] = splitReducer(maybeReducer);
21
22    const wrapped = wrapReducer(reducer, options);
23
24    return assembleReducer(wrapped, Provider);
25  }
```

The `wrapReducer` function receives the "child" reducer and the options we pass when invoking our `withAnalytics` plugin. Then it returns another reducer which will do all the logging (*line 6*). Like any other reducer, it must return the new state, so we can just invoke the child reducer (*line 15*).

Now we need to write our plugin funcion. It can receive a reducer, or an array of reducers, or a reducer which has already been extended with another plugin. To handle all of these cases, we call the `splitReducer` function, which returns the real reducer function and a React component which is the (optional) context provider (*line 20*).

After we have wrapped the reducer, we can return it. Since we haven't built any new context provider, we have to return the one we received. To do this we use the `assembleReducer` function (*line 24*).

Our plugin is ready to be used in our application:

*container.jsx*
```jsx
import counterReducer from './counter-reducer';
import withAnalytics from './with-analytics';
import { createContainer } from 'monarc';

const options = { endpointUrl: 'https://example.com/etc...' };
const reducer = withAnalytics(counterReducer, options);

function AppContainer() {
  return (
    <div>
      <Header user={store.user} />
      <Application />
    </div>
  );
}

export default createContainer(AppContainer, reducer);
```

## Creating a context

Suppose that now we want to display the number of actions logged. We need to create a context provider so that other components of our application can read it and display it in the right place.

First we need to create a context with React's `createContext` (*line 8*) and then a custom hook to read from our context (*line 10*).

```jsx
 1  import React, { useMemo, useState, useContext, createContext } from 'react';
 2  import { splitReducer, assembleReducer} from 'monarc';
 3
 4  function wrapReducer(reduce, options, ctx) {
 5    ...
 6  }
 7
 8  export const analyticsContext = createContext(0);
 9
10  export function useAnalytics() {
11    return useContext(analyticsContext);
12  }
13
14  export function withAnalytics(maybeReducer, options) {
15    ...
16  }
```

Then we create our component, which renders the context provider with the number of actions processed. We have to also render the `<Provider>` we have been passed (*line 9*) and our children. Then we can return our wrapped reducer and our new component (*line 22*).

```jsx
 1  export function withAnalytics(maybeReducer, options) {
 2    const [ reducer, Provider ] = splitReducer(maybeReducer);
 3
 4    const AnalyticsProvider = ({ children }) => {
 5      const [ count, setCount ] = useState(0);
 6
 7      return (
 8        <analyticsContext.Provider value={count}>
 9          <Provider>
10            {children}
11          </Provider>
12        </analyticsContext.Provider>
13      );
14    };
15
16    AnalyticsProvider.propTypes = {
17      children: PropTypes.node
18    };
19
20    ...
21
22    return assembleReducer(wrapped, AnalyticsProvider);
23  }
```

Now we just need a way to increment our counter every time we process an action.

```jsx
 1  function wrapReducer(reduce, options, ctx) {
 2    const url = options.endpointUrl;
 3
 4    return function analytics(state, action) {
 5      fetch(url, {
 6        body:    JSON.stringify(action),
 7        method:  'POST',
 8        headers: {
 9          'Content-Type': 'application/json'
10        }
11      })
12      .then(() => {
13        ctx.increment();
14      });
15
16      return reduce(state, action);
17    }
18  }
19
20  ...
21
22  export function withAnalytics(maybeReducer, options) {
23    const [ reducer, Provider ] = splitReducer(maybeReducer);
24
25    const ctx = {
26      increment: () => null
27    };
28
29    const AnalyticsProvider = ({ children }) => {
30      const [ count, setCount ] = useState(0);
31
32      useEffect(() => {
33        ctx.increment = () => setCount(count + 1);
34      }, [ count ]);
35
36      return (
37        ...
38      );
39    };
40
41    ...
42
43    const wrapped = wrapReducer(reducer, options, ctx);
44
45    return assembleReducer(wrapped, AnalyticsProvider);
46  }
```

We create an object (*line 25*) that gets passed to our reducer (*line 43*). In our reducer we will then call the `increment` method after our POST to the logging server (*line 13*). There's a catch though: since React's hooks works only inside components, we can't prepare our `increment` function immediately. We have to wait for our component to be rendered first, then we can replace the dummy `increment` with the real one calling `setCount`. To do this we can use the `useEffect` hook (*line 32*).

**NOTE:** In this example we can use the `useState` hook because we are updating the counter asynchronously, i.e. after the action have been processed and the new state has been created. If we tried to call `setCount` synchronously, we would have had an error, because we would have had both the `<Container />` and our `<AnalyticsProvider />` trying to render at the same time, and React doesn't like that...

If we can't update our counter asynchronously, we can simply put a `count` value instead of the `increment` function and update that. After the action has been processed the `<Container />` will re-render and so will do our `<AnalyticsProvider />`. Then we just need to read `ctx.count`.

```jsx
export function withAnalytics(maybeReducer, options) {
  const [ reducer, Provider ] = splitReducer(maybeReducer);

  const ctx = {
    count: 0
  };

  const AnalyticsProvider = ({ children }) => {
    const count = ctx.count;

    return (
      <analyticsContext.Provider value={count}>
        <Provider>
          {children}
        </Provider>
      </analyticsContext.Provider>
    );
  };

  ...
}
```
