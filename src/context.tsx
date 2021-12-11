import { useContext, createContext, useCallback } from 'react';
import type { Action, Dispatch } from './typings';

// ---------------------------------------------------------------------

type StoreContext<S, A extends Action> = {
  dispatch: Dispatch<A>;
  state: S;
}

// ---------------------------------------------------------------------

export const storeContext = createContext<StoreContext<any, any>>({
  dispatch: () => undefined,
  state:    {}
});

export function useDispatch<A extends Action>(): Dispatch<A> {
  const { dispatch } = useContext(storeContext);

  return useCallback((action: A | Promise<A>) => {
    if (typeof action.then === 'function') {
      action.then(dispatch);
    } else {
      dispatch(action);
    }
  }, [ dispatch ]);
}

export function useStore<S, A extends Action>(): S {
  const { state } = useContext<StoreContext<S, A>>(storeContext);

  return state;
}
