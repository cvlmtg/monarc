import invariant from 'tiny-invariant';
import React, {
  ComponentType, Fragment, FunctionComponent,
  createContext, useContext, Context
} from 'react';

// ---------------------------------------------------------------------

export function splitReducer<S, A extends Action>(
  anyReducer: AnyReducer<S>
): [
  Reducer<S, A>,
  ComponentType
] {
  const reducerProvider = anyReducer as ReducerProvider<S>;
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
  wrapReducer: WrapReducer<S, O>,
  useValue: UseValue<O>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O>,
  UsePlugin<C>,
  Context<C>
] {
  const initContext = createContext<unknown>(null);
  const useInit     = () => useContext(initContext);

  const withPlugin = (anyReducer: AnyReducer<S>, options?: Partial<O>) => {
    const [ reducer, Provider ] = splitReducer<S, A>(anyReducer);

    const ps      = {};
    const opts    = { ...defaults, ...options } as O;
    const wrapped = wrapReducer(reducer, ps, opts);

    const PluginProvider: FunctionComponent = ({ children }) => {
      const value = useValue(ps, opts);

      return (
        <initContext.Provider value={value}>
          <Provider>
            {children}
          </Provider>
        </initContext.Provider>
      );
    };

    if (process.env.NODE_ENV === 'test') {
      return { reducer: wrapped, Provider: PluginProvider, ps };
    }

    return { reducer: wrapped, Provider: PluginProvider };
  };

  const context   = initContext as Context<C>;
  const usePlugin = useInit as UsePlugin<C>;

  return [ withPlugin, usePlugin, context ];
}

function simple<S, O, A extends Action>(
  wrapReducer: WrapReducer<S, O>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O>
] {
  const withPlugin = (anyReducer: AnyReducer<S>, options?: Partial<O>) => {
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

export function createPlugin<S, O>(
  wrapReducer: WrapReducer<S, O>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O>
];

export function createPlugin<S, O, C>(
  wrapReducer: WrapReducer<S, O>,
  useValue: UseValue<O>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O>,
  UsePlugin<C>,
  Context<C>
];

export function createPlugin<S, O, C>(
  wrapReducer: WrapReducer<S, O>,
  useValue?: UseValue<O> | Partial<O>,
  defaults?: Partial<O>
): [
  WithPlugin<S, O>,
  UsePlugin<C>,
  Context<C>
] | [
  WithPlugin<S, O>
] {
  if (typeof useValue === 'function') {
    return full(wrapReducer, useValue, defaults);
  }

  return simple(wrapReducer, useValue);
}
