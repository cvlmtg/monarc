import { useContext, Context, createContext } from 'react';
import type { State, Dispatch } from './typings';

// ---------------------------------------------------------------------

type StoreContext = {
  dispatch: Dispatch;
  state: State;
}

// ---------------------------------------------------------------------

export const storeContext: Context<StoreContext> = createContext<StoreContext>({
  dispatch: () => undefined,
  state:    {}
});

export function useDispatch(): Dispatch {
  const { dispatch } = useContext(storeContext);

  return dispatch;
}

export function useStore(): State {
  const { state } = useContext(storeContext);

  return state;
}
