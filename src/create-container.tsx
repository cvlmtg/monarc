import type { MaybeReducer, State, Dispatch } from './typings';
import { splitReducer } from './create-plugin';
import { storeContext } from './context';
import React, {
  useLayoutEffect, useReducer, useMemo,
  ComponentType, FunctionComponent
} from 'react';

// ---------------------------------------------------------------------

type Container = FunctionComponent<{
  initialState: State;
  children?: any;
}>;

type Dispatcher = {
  dispatch: Dispatch;
}

// ---------------------------------------------------------------------

export function createContainer(
  Component: ComponentType<{ store: State }>,
  maybeReducer: MaybeReducer,
  dispatcher?: Dispatcher
): Container {
  const [ reducer, Provider ] = splitReducer(maybeReducer);

  const StoreContainer: Container = ({ initialState, children }) => {
    const [ state, dispatch ] = useReducer(reducer, initialState);

    const value = useMemo(() => ({ state, dispatch }), [ state ]);

    useLayoutEffect(() => {
      if (dispatcher) {
        dispatcher.dispatch = dispatch;
      }
    }, []);

    return (
      <storeContext.Provider value={value}>
        <Provider>
          <storeContext.Consumer>
            {(current): JSX.Element => (
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
