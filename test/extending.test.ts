import { createPlugin } from '../src/index';

// ---------------------------------------------------------------------

type AppState = {
  count: number;
};

type LogState = {
  actions: string[];
};

function reduce(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'increment-count':
      return { count: state.count + 1 };

    default:
      return state;
  }
}

function wrapReducer(
  reducer: Reducer<AppState, Action>,
  ps: Partial<LogState>
): Reducer<AppState, Action> {
  ps.actions  = [];

  const PS = ps as LogState;

  return (state: AppState, action: Action): AppState => {
    const updated = reducer(state, action);

    PS.actions.push(action.type);

    return updated;
  };
}

const [ withLogging ] = createPlugin(wrapReducer);

// ---------------------------------------------------------------------

describe('the withLogging custom plugin', () => {
  let state: AppState;

  beforeEach(() => {
    state = { count: 1 };
  });

  it('extends one or more reducers', () => {
    const simple = () => withLogging(reduce);
    const one    = () => withLogging([ reduce ]);
    const two    = () => withLogging([ reduce, reduce ]);

    expect(simple).not.toThrow();
    expect(one).not.toThrow();
    expect(two).not.toThrow();
  });

  it('rejects invalid reducers', () => {
    const emptyArr = () => withLogging([]);

    expect(emptyArr).toThrow();
  });

  it('reduces a state and an action', () => {
    const { reducer, ps } = withLogging(reduce);
    const PS = ps as LogState;
    let updated;

    updated = reducer(state, { type: 'increment-count' });
    updated = reducer(updated, { type: 'whatever' });

    expect(state.count).toBe(1);
    expect(updated.count).toBe(2);
    expect(PS.actions).toEqual([
      'increment-count',
      'whatever'
    ]);
  });
});
