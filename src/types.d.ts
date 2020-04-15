import type { FunctionComponent } from 'react';

// --------------------------------------------------

type MaybeReducer = ReducerProvider | Array<Reducer> | Reducer;
type Reducer = (state: State, action: Action) => State;
type State = any;

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
