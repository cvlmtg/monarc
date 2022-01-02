import type { ComponentType } from 'react';

// ---------------------------------------------------------------------

export type PluginState = {
  [k: string]: unknown;
};

export interface Action {
  type: string;
  [k: string]: any;
}

export type ReducerProvider<S, A extends Action> = {
  Provider: ComponentType;
  reducer: Reducer<S, A>;
  ps?: PluginState;
};

export type Dispatch<A extends Action> = (action: A | Promise<A>) => void;
export type Reducer<S, A extends Action> = (state: S, action: A) => S;
export type AnyReducer<S, A extends Action> = ReducerProvider<S, A> | Array<Reducer<S, A>> | Reducer<S, A>;

export type EmptyDispatcher<A extends Action> = { dispatch: Dispatch<A> | null };
export type Dispatcher<A extends Action> = { dispatch: Dispatch<A> };

export type WrapReducer<S, O, A extends Action> = (
  reducer: Reducer<S, A>,
  ps: Partial<PluginState>,
  options: O
) => Reducer<S, A>;

export type UseValue<O> = (
  ps: Partial<PluginState>,
  options: O
) => unknown;

export type WithPlugin<S, O, A extends Action> = (
  anyReducer: AnyReducer<S, A>,
  options?: Partial<O>
) => ReducerProvider<S, A>;

export type UsePlugin<C> = () => C;
