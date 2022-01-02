import type { Action, AnyReducer, EmptyDispatcher } from './typings';
import { splitReducer } from './create-plugin';
import { storeContext } from './context';
import React, {
  useLayoutEffect, useEffect, useReducer, useMemo,
  ComponentType, FunctionComponent
} from 'react';

// ---------------------------------------------------------------------

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function isPromise(value: Action | Promise<Action>): value is Promise<Action> {
  return typeof value.then === 'function';
}

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

    useIsomorphicLayoutEffect(() => {
      if (typeof dispatcher === 'undefined') {
        return;
      }

      dispatcher.dispatch = (action: A | Promise<A>) => {
        if (isPromise(action)) {
          action.then(dispatch);
        } else {
          dispatch(action);
        }
      };
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
