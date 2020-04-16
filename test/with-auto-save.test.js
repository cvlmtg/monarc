import { withAutoSave, withUndoRedo } from '../src/index';
import { Record } from 'immutable';

// ---------------------------------------------------------------------

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

describe('the withAutoSave constructor', () => {
  let state;

  beforeEach(() => {
    state = new State();
  });

  it('extends one or more reducers', () => {
    const options = { onSave: () => false };
    const simple  = () => withAutoSave(reduce, options);
    const one     = () => withAutoSave([ reduce ], options);
    const two     = () => withAutoSave([ reduce, reduce ], options);

    expect(simple).not.toThrow();
    expect(one).not.toThrow();
    expect(two).not.toThrow();
  });

  it('extends a "super reducer"', () => {
    const undo    = withUndoRedo(reduce);
    const options = { onSave: () => false };
    const valid   = () => withAutoSave(undo, options);

    expect(valid).not.toThrow();
  });

  it('checks for a valid delay option', () => {
    const options = { onSave: () => false, delay: -1 };
    const invalid = () => withAutoSave(reduce, options);

    expect(invalid).toThrow();
  });

  it('enforces the onSave option', () => {
    const options = { onSave: () => false };
    const wrong   = () => withAutoSave(reduce, {});
    const valid   = () => withAutoSave(reduce, options);

    expect(wrong).toThrow();
    expect(valid).not.toThrow();
  });

  it('reduce a state and an action', () => {
    const options     = { onUpdate: () => false, onSave: () => false };
    const { reducer } = withAutoSave(reduce, options);
    const action      = { type: 'increment-count' };
    const updated     = reducer(state, action);

    expect(state.count).toBe(1);
    expect(updated.count).toBe(2);
  });
});
