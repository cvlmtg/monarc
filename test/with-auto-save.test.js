import { withAutoSave, withUndoRedo } from '../src/index';
import { Record } from 'immutable';

// ---------------------------------------------------------------------
/* eslint-disable @typescript-eslint/explicit-function-return-type */

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

describe('the withAutoSave plugin', () => {
  let state;

  beforeEach(() => {
    state = new State();
  });

  it('extends one or more reducers', () => {
    const options = { onSave: () => false };
    const simple  = () => withAutoSave(reduce, options);
    const one     = () => withAutoSave([ reduce ], options);
    const two     = () => withAutoSave([ reduce, reduce ], options);

    expect(one).not.toThrow();
    expect(two).not.toThrow();
    expect(simple).not.toThrow();
  });

  it('rejects invalid reducers', () => {
    const emptyArr = () => withAutoSave([]);
    const wrongObj = () => withAutoSave({});
    const noArg    = () => withAutoSave();

    expect(emptyArr).toThrow();
    expect(wrongObj).toThrow();
    expect(noArg).toThrow();
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

  it('starts the timer on update', (done) => {
    const action = { type: 'increment-count' };
    let updated  = null;

    const { reducer } = withAutoSave(reduce, {
      onSave: (saving) => {
        expect(state.count).toBe(1);
        expect(saving.count).toBe(2);
        expect(updated.count).toBe(2);
        expect(updated).toBe(saving);
        done();
      },
      delay: 0
    });

    updated = reducer(state, action);
  });

  it("doesn't start the timer if it's already running", (done) => {
    const action = { type: 'increment-count' };
    let updated  = null;

    const { reducer } = withAutoSave(reduce, {
      onSave: (saving) => {
        expect(state.count).toBe(1);
        expect(saving.count).toBe(3);
        expect(updated.count).toBe(3);
        expect(updated).toBe(saving);
        done();
      },
      delay: 0
    });

    updated = reducer(state, action);
    updated = reducer(updated, action);
  });

  it("doesn't start the timer when saving immediately", (done) => {
    const action = { type: 'increment-count' };
    let updated  = null;

    const { reducer } = withAutoSave(reduce, {
      onBeforeUpdate: () => true,
      onUpdate:       () => true,
      onSave:         (saving) => {
        expect(state.count).toBe(1);
        expect(saving.count).toBe(1);
        expect(updated).toBe(null);
        done();
      },
      delay: 100
    });

    updated = reducer(state, action);

    expect(updated.count).toBe(2);
  });

  it('handles both onUpdate and onBeforeUpdate', (done) => {
    const action = { type: 'increment-count' };
    let before   = false;
    let updated  = null;

    const { reducer } = withAutoSave(reduce, {
      onBeforeUpdate: (prev) => prev.count % 3 === 0,
      onUpdate:       () => true,
      onSave:         (saving) => {
        if (before === false) {
          expect(saving.count).toBe(3);
        } else {
          expect(saving.count).toBe(5);
          done();
        }
        before = true;
      },
      delay: 3
    });

    updated = reducer(state, action);   // 2
    updated = reducer(updated, action); // 3
    updated = reducer(updated, action); // 4 -> save previous
    updated = reducer(updated, action); // 5

    expect(state.count).toBe(1);
    expect(updated.count).toBe(5);
  });
});
