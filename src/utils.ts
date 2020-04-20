import type { MaybeReducer, ReducerProvider, Reducer, State, Action } from './typings';
import { ElementType, Fragment } from 'react';
import invariant from 'tiny-invariant';

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

export function assembleReducer(
  reducer: Reducer,
  Provider: ElementType,
  ctx?: object
): ReducerProvider {
  if (ctx && process.env.NODE_ENV === 'test') {
    return { reducer, Provider, ctx };
  }

  return { reducer, Provider };
}
