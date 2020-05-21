import { createPlugin } from '../src/index';
import { Record } from 'immutable';

// ---------------------------------------------------------------------
/* eslint-disable @typescript-eslint/explicit-function-return-type */

function wrapReducer(reduce, ctx) {
  ctx.actions = [];

  return (state, action) => {
    const updated = reduce(state, action);

    ctx.actions.push(action.type);

    return updated;
  };
}

const [ withLogging ] = createPlugin(wrapReducer);

const reduce = (state, action) => {
  switch (action.type) {
    case 'increment-count':
      return state.set('count', state.count + 1);

    default:
      return state;
  }
};

const State = new Record({
  count: 1
});

// ---------------------------------------------------------------------

describe('the withLogging custom plugin', () => {
  let state;

  beforeEach(() => {
    state = new State();
  });

  it('extends one or more reducers', () => {
    const simple = () => withLogging(reduce);
    const one    = () => withLogging([ reduce ]);
    const two    = () => withLogging([ reduce, reduce ]);

    expect(one).not.toThrow();
    expect(two).not.toThrow();
    expect(simple).not.toThrow();
  });

  it('rejects invalid reducers', () => {
    const emptyArr = () => withLogging([]);
    const wrongObj = () => withLogging({});
    const noArg    = () => withLogging();

    expect(emptyArr).toThrow();
    expect(wrongObj).toThrow();
    expect(noArg).toThrow();
  });

  it('reduces a state and an action', () => {
    const { reducer, ctx } = withLogging(reduce);
    let updated;

    updated = reducer(state, { type: 'increment-count' });
    updated = reducer(updated, { type: 'whatever' });

    expect(state.count).toBe(1);
    expect(updated.count).toBe(2);
    expect(ctx.actions).toEqual([
      'increment-count',
      'whatever'
    ]);
  });
});
