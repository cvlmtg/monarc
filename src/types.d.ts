import type { Record, List, Map } from 'immutable';
import type { FunctionComponent } from 'react';

// --------------------------------------------------

type MaybeReducer = ReducerProvider | Array<Reducer> | Reducer;
type Reducer = (state: State, action: Action) => State;
type State = Record | List | Map;

type ReducerProvider = {
  Provider: FunctionComponent<{}>;
  reducer: Reducer;
  ctx?: object;
}

interface Action {
  undoStream?: boolean;
  undoReset?: boolean;
  undoSkip?: boolean;
  type: string;
}
