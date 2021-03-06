import invariant from 'tiny-invariant';
import React, {
  FunctionComponent, ElementType, Fragment,
  Context, createContext, useContext
} from 'react';
import type {
  WrapReducer, MaybeReducer, ReducerProvider, Reducer,
  State, Action
} from './typings';

// ---------------------------------------------------------------------

type StorePlugin = [
  (maybeReducer: MaybeReducer, options: object) => ReducerProvider,
  Function | undefined,
  Context<any> | undefined
];

// ---------------------------------------------------------------------

export function splitReducer(maybeReducer: MaybeReducer): [ Reducer, ElementType ] {
  const reducerProvider: ReducerProvider = maybeReducer as ReducerProvider;
  const reducers: Array<Reducer>         = maybeReducer as Array<Reducer>;

  if (typeof reducerProvider.reducer !== 'undefined') {
    return [
      reducerProvider.reducer,
      reducerProvider.Provider
    ];
  }

  if (typeof maybeReducer === 'function') {
    return [ maybeReducer, Fragment ];
  }

  invariant(Array.isArray(reducers), 'invalid reducer(s) supplied');
  invariant(reducers.length !== 0, 'no reducers supplied');

  if (reducers.length === 1) {
    return [ reducers[0], Fragment ];
  }

  const reducer = (state: State, action: Action): State => {
    const update = (updated: State, reduce: Reducer): State => reduce(updated, action);

    return reducers.reduce(update, state);
  };

  return [ reducer, Fragment ];
}

// ---------------------------------------------------------------------

function full(wrapReducer: WrapReducer, useValue: Function, defaults?: object): StorePlugin {
  const context: Context<any> = createContext(null);

  function withPlugin(maybeReducer: MaybeReducer, options: object): ReducerProvider {
    const [ reducer, Provider ] = splitReducer(maybeReducer);

    const ctx     = {};
    const opts    = { ...defaults, ...options };
    const wrapped = wrapReducer(reducer, ctx, opts);

    const PluginProvider: FunctionComponent = ({ children }) => {
      const value = useValue(ctx, opts);

      return (
        <context.Provider value={value}>
          <Provider>
            {children}
          </Provider>
        </context.Provider>
      );
    };

    if (process.env.NODE_ENV === 'test') {
      return { reducer: wrapped, Provider: PluginProvider, ctx };
    }

    return { reducer: wrapped, Provider: PluginProvider };
  }

  function usePlugin(): Context<any> {
    return useContext(context);
  }

  return [ withPlugin, usePlugin, context ];
}

function simple(wrapReducer: WrapReducer, defaults?: object): StorePlugin {
  function withPlugin(maybeReducer: MaybeReducer, options: object): ReducerProvider {
    const [ reducer, Provider ] = splitReducer(maybeReducer);

    const ctx     = {};
    const opts    = { ...defaults, ...options };
    const wrapped = wrapReducer(reducer, ctx, opts);

    if (process.env.NODE_ENV === 'test') {
      return { reducer: wrapped, Provider, ctx };
    }

    return { reducer: wrapped, Provider };
  }

  return [ withPlugin, undefined, undefined ];
}

export function createPlugin(wrapReducer: WrapReducer, useValue?: Function, defaults?: object): StorePlugin {
  if (typeof useValue === 'function') {
    return full(wrapReducer, useValue, defaults);
  }

  return simple(wrapReducer, useValue);
}
