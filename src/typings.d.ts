type PluginState = {
  [k: string]: unknown;
};

interface Action {
  type: string;
  [k: string]: unknown;
}

type ReducerProvider<S> = {
  Provider: ComponentType;
  reducer: Reducer<S>;
  ps?: PluginState;
};

type Dispatch<A extends Action> = (action: A) => void;
type Reducer<S, A extends Action> = (state: S, action: A) => S;
type AnyReducer<S> = ReducerProvider<S> | Array<Reducer<S>> | Reducer<S>;

type EmptyDispatcher = { dispatch: Dispatch | null };
type Dispatcher = { dispatch: Dispatch };

type WrapReducer<S, O> = (
  reducer: Reducer<S>,
  ps: Partial<PluginState>,
  options: O
) => Reducer<S>;

type UseValue<O> = (
  ps: Partial<PluginState>,
  options: O
) => unknown;

type WithPlugin<S, O> = (
  anyReducer: AnyReducer<S>,
  options?: Partial<O>
) => ReducerProvider<S>;

type UsePlugin<C> = () => C;
