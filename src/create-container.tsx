import type { MaybeReducer, State, Action } from './typings';
import { splitReducer } from './utils';
import PropTypes from 'prop-types';
import React, {
  Context, createContext, useContext, useEffect, useReducer, useMemo,
  ComponentType, FunctionComponent
} from 'react';

// ---------------------------------------------------------------------

type Container = FunctionComponent<{
  initialState: State;
  children?: any;
}>;

type Dispatch = (action: Action) => void;

type Dispatcher = {
  dispatch: Dispatch;
}

type StoreContext = {
  dispatch: Dispatch | null;
  state: State | null;
}

// ---------------------------------------------------------------------

export const storeContext: Context<StoreContext> = createContext<StoreContext>({
  dispatch: null,
  state:    null
});

export function useDispatch(): Dispatch | null {
  const { dispatch } = useContext(storeContext);

  return dispatch;
}

export function useStore(): State | null {
  const { state } = useContext(storeContext);

  return state;
}

export function createContainer(
  Component: ComponentType<{ store: State }>,
  maybeReducer: MaybeReducer,
  dispatcher?: Dispatcher
): Container {
  const [ reducer, Provider ] = splitReducer(maybeReducer);

  const StoreContainer: Container = ({ initialState, children }) => {
    const [ state, dispatch ] = useReducer(reducer, initialState);

    const value = useMemo(() => ({ state, dispatch }), [ state ]);

    useEffect(() => {
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

  StoreContainer.propTypes = {
    initialState: PropTypes.object.isRequired,
    children:     PropTypes.any
  };

  return StoreContainer;
}
