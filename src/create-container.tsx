import type { Action, AnyReducer, EmptyDispatcher } from './typings';
import { splitReducer } from './create-plugin';
import { storeContext } from './context';
import React, {
  useLayoutEffect, useEffect, useReducer, useMemo,
  ComponentType, FunctionComponent
} from 'react';

// ---------------------------------------------------------------------

type Container<S> = FunctionComponent<{
  initialState: S;
  children?: unknown;
}>;

// ---------------------------------------------------------------------

export function createContainer<S, A extends Action>(
  Component: ComponentType<{ store: S }>,
  anyReducer: AnyReducer<S, A>,
  dispatcher?: EmptyDispatcher<A>
): Container<S> {
  const [ reducer, Provider ] = splitReducer(anyReducer);

  const StoreContainer: Container<S> = ({ initialState, children }) => {
    const [ state, dispatch ] = useReducer(reducer, initialState);

    const value = useMemo(() => ({ state, dispatch }), [ state ]);

    const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

    useIsomorphicLayoutEffect(() => {
      if (dispatcher) {
        dispatcher.dispatch = dispatch;
      }
    }, []);

    return (
      <storeContext.Provider value={value}>
        <Provider>
          <storeContext.Consumer>
            {(current) => (
              <Component store={current.state}>
                {children}
              </Component>
            )}
          </storeContext.Consumer>
        </Provider>
      </storeContext.Provider>
    );
  };

  return StoreContainer;
}
