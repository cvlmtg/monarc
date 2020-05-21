import type { ElementType } from 'react';

// --------------------------------------------------

type ReducerExtender = (maybeReducer: MaybeReducer, options: object) => ReducerProvider;
type MaybeReducer = ReducerProvider | Array<Reducer> | Reducer;
type Reducer = (state: State, action: Action) => State;
type State = any;

type ReducerProvider = {
  Provider: ElementType;
  reducer: Reducer;
  ctx?: object;
}

interface Action {
  undoStream?: boolean;
  undoReset?: boolean;
  undoSkip?: boolean;
  type: string;
}
