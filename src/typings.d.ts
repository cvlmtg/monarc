import type { ElementType } from 'react';

// --------------------------------------------------

type WrapReducer = (reduce: Reducer, ctx: any, options: any) => Reducer;
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
