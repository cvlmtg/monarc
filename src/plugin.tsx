import type { MaybeReducer, ReducerProvider, Reducer, State, Action } from './typings';
import invariant from 'tiny-invariant';
import clone from './clone';
import React, {
  FunctionComponent, ElementType, Fragment,
  Context, createContext, useContext
} from 'react';

// ---------------------------------------------------------------------

type Plugin = {
  withPlugin: (maybeReducer: MaybeReducer, options: object) => ReducerProvider;
  context?: Context<any>;
  usePlugin?: Function;
}

type PluginParams = {
  wrapReducer: Function;
  useValue?: Function;
  defaults?: object;
  ctx?: object;
}

type FullParams = {
  wrapReducer: Function;
  useValue: Function;
  defaults?: object;
  ctx?: object;
}

type SimpleParams = {
  wrapReducer: Function;
  defaults?: object;
  ctx?: object;
}

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

function full(params: FullParams): Plugin {
  const wrapReducer = params.wrapReducer;
  const defaults    = params.defaults;
  const useValue    = params.useValue;

  function withPlugin(maybeReducer: MaybeReducer, options: object): ReducerProvider {
    const [ reducer, Provider ] = splitReducer(maybeReducer);

    const ctx     = clone(params.ctx);
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

  const context: Context<any> = createContext(null);

  function usePlugin(): Context<any> {
    return useContext(context);
  }

  return { withPlugin, usePlugin, context };
}

function simple(params: SimpleParams): Plugin {
  const wrapReducer = params.wrapReducer;
  const defaults    = params.defaults;

  function withPlugin(maybeReducer: MaybeReducer, options: object): ReducerProvider {
    const [ reducer, Provider ] = splitReducer(maybeReducer);

    const ctx     = clone(params.ctx);
    const opts    = { ...defaults, ...options };
    const wrapped = wrapReducer(reducer, ctx, opts);

    if (process.env.NODE_ENV === 'test') {
      return { reducer: wrapped, Provider, ctx };
    }

    return { reducer: wrapped, Provider };
  }

  return { withPlugin };
}

export function createPlugin(params: PluginParams): Plugin {
  if (params.useValue === undefined) {
    return simple(params as SimpleParams);
  }

  return full(params as FullParams);
}
