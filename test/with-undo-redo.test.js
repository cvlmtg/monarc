import { withUndoRedo, withAutoSave } from '../src/index';
import { Record, List } from 'immutable';

// ---------------------------------------------------------------------

const reduce = (state, action) => {
  switch (action.type) {
    case 'add-message':
      return state.set('messages', state.messages.push('foo'));

    case 'increment-count':
      return state.set('count', state.count + 1);

    default:
      return state;
  }
};

const State = new Record({
  messages: new List(),
  count:    1
});

// ---------------------------------------------------------------------

describe('the withUndoRedo constructor', () => {
  let state;

  beforeEach(() => {
    state = new State();
  });

  it('extends one or more reducers', () => {
    const options = { onSave: () => false };
    const simple  = () => withUndoRedo(reduce, options);
    const one     = () => withUndoRedo([ reduce ], options);
    const two     = () => withUndoRedo([ reduce, reduce ], options);

    expect(one).not.toThrow();
    expect(two).not.toThrow();
    expect(simple).not.toThrow();
  });

  it('checks for correct ordering (1)', () => {
    const options = { onSave: () => false };
    const valid   = () => withAutoSave(withUndoRedo(reduce), options);

    expect(valid).not.toThrow();
  });

  it('checks for correct ordering (2)', () => {
    const options = { onSave: () => false };
    const invalid = () => withUndoRedo(withAutoSave(reduce, options));

    expect(invalid).toThrow();
  });

  it('checks for a valid maxUndo option', () => {
    const options = { maxUndo: -1 };
    const invalid = () => withUndoRedo(reduce, options);

    expect(invalid).toThrow();
  });

  it('reduces a state and an action', () => {
    const { reducer } = withUndoRedo(reduce);
    const action      = { type: 'increment-count' };
    const updated     = reducer(state, action);

    expect(state.count).toBe(1);
    expect(updated.count).toBe(2);
  });

  describe('keeps the correct amount of undoable states', () => {
    it('whole state', () => {
      const options          = { maxUndo: 2 };
      const action           = { type: 'increment-count' };
      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);

      expect(state.count).toBe(1);
      expect(updated.count).toBe(5);
      expect(ctx.undo.length).toBe(2);
      expect(ctx.redo.length).toBe(0);
    });

    it('partial state (1)', () => {
      const action           = { type: 'increment-count' };
      const options          = { maxUndo: 2, stateKey: 'data' };
      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);

      expect(state.count).toBe(1);
      expect(updated.count).toBe(5);
      expect(ctx.undo.length).toBe(0);
      expect(ctx.redo.length).toBe(0);
    });

    it('partial state (2)', () => {
      const action           = { type: 'add-message' };
      const options          = { maxUndo: 2, stateKey: 'messages' };
      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);

      expect(state.messages.size).toBe(0);
      expect(updated.messages.size).toBe(4);
      expect(ctx.undo.length).toBe(2);
      expect(ctx.redo.length).toBe(0);
    });
  });

  describe('keeps the correct amount of redoable states', () => {
    it('keeps the correct amount of redoable states', () => {
      const options          = { maxUndo: 2 };
      const undo             = { type: 'UNDO' };
      const action           = { type: 'increment-count' };
      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, action);   // count === 2
      updated = reducer(updated, action); // count === 3
      updated = reducer(updated, action); // count === 4
      updated = reducer(updated, action); // count === 5
      updated = reducer(updated, undo);   // count === 4
      updated = reducer(updated, undo);   // count === 3
      updated = reducer(updated, undo);   // count === 3
      updated = reducer(updated, undo);   // count === 3

      expect(state.count).toBe(1);
      expect(updated.count).toBe(3);
      expect(ctx.undo.length).toBe(0);
      expect(ctx.redo.length).toBe(2);
    });

    it('partial state (1)', () => {
      const undo             = { type: 'UNDO' };
      const action           = { type: 'increment-count' };
      const options          = { maxUndo: 2, stateKey: 'data' };
      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);

      expect(state.count).toBe(1);
      expect(updated.count).toBe(5);
      expect(ctx.undo.length).toBe(0);
      expect(ctx.redo.length).toBe(0);
    });

    it('partial state (2)', () => {
      const undo             = { type: 'UNDO' };
      const action           = { type: 'add-message' };
      const options          = { maxUndo: 2, stateKey: 'messages' };
      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);
      updated = reducer(updated, action);
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);

      expect(state.messages.size).toBe(0);
      expect(updated.messages.size).toBe(2);
      expect(ctx.undo.length).toBe(0);
      expect(ctx.redo.length).toBe(2);
    });
  });
});
