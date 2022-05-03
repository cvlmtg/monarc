import invariant from 'tiny-invariant';
import type {
  Action, AnyReducer, Reducer, ReducerProvider, WrapReducer,
  UseValue, UsePlugin, WithPlugin
} from './typings';
import React, {
  ComponentType, Fragment, FunctionComponent,
  createContext, useContext, Context
} from 'react';

// ---------------------------------------------------------------------

export function splitReducer<S, A extends Action>(
  anyReducer: AnyReducer<S, A>
): [
  Reducer<S, A>,
  ComponentType
] {
  const reducerProvider = anyReducer as ReducerProvider<S, A>;
  const reducers        = anyReducer as Array<Reducer<S, A>>;

  if (typeof reducerProvider.reducer !== 'undefined') {
    return [
      reducerProvider.reducer,
      reducerProvider.Provider
    ];
  }

  if (typeof anyReducer === 'function') {
    return [ anyReducer, Fragment ];
  }

  invariant(Array.isArray(reducers), 'invalid reducer(s) supplied');
  invariant(reducers.length !== 0, 'no reducers supplied');

  if (reducers.length === 1) {
    return [ reducers[0], Fragment ];
  }

  const reducer = (state: S, action: A): S => {
    const update = (updated: S, reduce: Reducer<S, A>) => reduce(updated, action);

    return reducers.reduce(update, state);
  };

  return [ reducer, Fragment ];
}

// ---------------------------------------------------------------------

function full<S, O, C, A extends Action>(
  wrapReducer: WrapReducer<S, O, A>,
  useValue: UseValue<O, C>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O, A>,
  UsePlugin<C>,
  Context<C>
] {
  const context   = createContext<unknown>(null) as Context<C>;
  const usePlugin = () => useContext(context);

  const withPlugin = (anyReducer: AnyReducer<S, A>, options?: Partial<O>) => {
    const [ reducer, Provider ] = splitReducer<S, A>(anyReducer);

    const ps      = {};
    const opts    = { ...defaults, ...options } as O;
    const wrapped = wrapReducer(reducer, ps, opts);

    const PluginProvider: FunctionComponent = ({ children }) => {
      const value = useValue(ps, opts);

      return (
        <context.Provider value={value}>
          <Provider>
            {children}
          </Provider>
        </context.Provider>
      );
    };

    if (process.env.NODE_ENV === 'test') {
      return { reducer: wrapped, Provider: PluginProvider, ps };
    }

    return { reducer: wrapped, Provider: PluginProvider };
  };

  return [ withPlugin, usePlugin, context ];
}

function simple<S, O, A extends Action>(
  wrapReducer: WrapReducer<S, O, A>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O, A>
] {
  const withPlugin = (anyReducer: AnyReducer<S, A>, options?: Partial<O>) => {
    const [ reducer, Provider ] = splitReducer<S, A>(anyReducer);

    const ps      = {};
    const opts    = { ...defaults, ...options } as O;
    const wrapped = wrapReducer(reducer, ps, opts);

    if (process.env.NODE_ENV === 'test') {
      return { reducer: wrapped, Provider, ps };
    }

    return { reducer: wrapped, Provider };
  };

  return [ withPlugin ];
}

export function createPlugin<S, O, A extends Action>(
  wrapReducer: WrapReducer<S, O, A>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O, A>
];

export function createPlugin<S, O, C, A extends Action>(
  wrapReducer: WrapReducer<S, O, A>,
  useValue: UseValue<O, C>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O, A>,
  UsePlugin<C>,
  Context<C>
];

export function createPlugin<S, O, C, A extends Action>(
  wrapReducer: WrapReducer<S, O, A>,
  useValue?: UseValue<O, C> | Partial<O>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O, A>,
  UsePlugin<C>,
  Context<C>
] | [
  WithPlugin<S, O, A>
] {
  if (typeof useValue === 'function') {
    return full(wrapReducer, useValue, defaults);
  }

  return simple(wrapReducer, useValue);
}
