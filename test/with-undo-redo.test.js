import { withUndoRedo, withAutoSave } from '../src/index';
import { Record, List } from 'immutable';

// ---------------------------------------------------------------------

const reduce = (state, action) => {
  switch (action.type) {
    case 'add-message':
      return state.set('messages', state.messages.push(action.message));

    case 'increment-count':
      return state.set('count', state.count + 1);

    case 'select-color':
      return state.set('color', action.color);

    case 'create-shape':
      return state.set('shapes', state.shapes.push({
        x: action.x,
        y: action.y,
        w: action.w,
        h: action.h
      }));

    case 'resize-shape':
      return state.withMutations((mutable) => {
        mutable.setIn([ 'shapes', action.index, 'w' ], action.w);
        mutable.setIn([ 'shapes', action.index, 'h' ], action.h);
      });

    case 'resize-ended':
      // do nothing here, just simulate an action dispatched on mouseup
      return state;

    default:
      return state;
  }
};

const State = new Record({
  shapes:   new List(),
  messages: new List(),
  color:    'white',
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

  it('rejects invalid reducers', () => {
    const emptyArr = () => withUndoRedo([]);
    const wrongObj = () => withUndoRedo({});
    const noArg    = () => withUndoRedo();

    expect(emptyArr).toThrow();
    expect(wrongObj).toThrow();
    expect(noArg).toThrow();
  });

  it('checks for correct ordering', () => {
    const options = { onSave: () => false };
    const valid   = () => withAutoSave(withUndoRedo(reduce), options);
    const invalid = () => withUndoRedo(withAutoSave(reduce, options));

    expect(valid).not.toThrow();
    expect(invalid).toThrow();
  });

  it('checks for a valid maxUndo option', () => {
    const invalid = () => withUndoRedo(reduce, { maxUndo: -1 });

    expect(invalid).toThrow();
  });

  describe('checks for getState / setState options', () => {
    const getState = () => null;
    const setState = () => null;

    it('when only getState is supplied', () => {
      const options = { getState };
      const invalid = () => withUndoRedo(reduce, options);

      expect(invalid).toThrow();
    });

    it('when only setState is supplied', () => {
      const options = { setState };
      const invalid = () => withUndoRedo(reduce, options);

      expect(invalid).toThrow();
    });

    it('when both are supplied', () => {
      const options = { getState, setState };
      const invalid = () => withUndoRedo(reduce, options);

      expect(invalid).not.toThrow();
    });

    it('when none are supplied', () => {
      const invalid = () => withUndoRedo(reduce);

      expect(invalid).not.toThrow();
    });
  });

  it('reduces a state and an action', () => {
    const { reducer } = withUndoRedo(reduce);
    const action      = { type: 'increment-count' };
    const updated     = reducer(state, action);

    expect(state.count).toBe(1);
    expect(updated.count).toBe(2);
  });

  it('resets everything', () => {
    const reset            = { type: 'increment-count', undoReset: true };
    const { reducer, ctx } = withUndoRedo(reduce, { maxUndo: 20 });
    const increment        = { type: 'increment-count' };
    let updated;

    updated = reducer(state, increment);
    updated = reducer(updated, increment);
    updated = reducer(updated, increment);
    updated = reducer(updated, increment);
    updated = reducer(updated, reset);
    updated = reducer(updated, increment);

    expect(state.count).toBe(1);
    expect(updated.count).toBe(7);
    expect(ctx.undo.length).toBe(1);
    expect(ctx.redo.length).toBe(0);
  });

  describe('skips some actions', () => {
    const increment = { type: 'increment-count' };
    const undo      = { type: 'UNDO' };

    function testOne(changeColor, options) {
      const { reducer, ctx } = withUndoRedo(reduce, options);
      const updated          = reducer(state, changeColor);

      expect(state.color).toBe('white');
      expect(updated.color).toBe('black');
      expect(ctx.undo.length).toBe(0);
      expect(ctx.redo.length).toBe(0);

      return updated;
    }

    function testTwo(changeColor, options) {
      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, increment);
      updated = reducer(updated, changeColor);
      updated = reducer(updated, undo);

      expect(state.count).toBe(1);
      expect(updated.count).toBe(1);
      expect(ctx.undo.length).toBe(0);
      expect(ctx.redo.length).toBe(1);

      return updated;
    }

    it('whole state', () => {
      const color   = { type: 'select-color', color: 'black', undoSkip: true };
      const options = { maxUndo: 8 };

      testOne(color, options);
      const updated = testTwo(color, options);

      expect(state.color).toBe('white');
      expect(updated.color).toBe('white');
    });

    it('partial state', () => {
      const color   = { type: 'select-color', color: 'black' };
      const options = {
        setState: (count, _state) => _state.set('count', count),
        getState: (_state) => _state.count,
        maxUndo:  8
      };

      testOne(color, options);
      const updated = testTwo(color, options);

      expect(state.color).toBe('white');
      expect(updated.color).toBe('black');
    });
  });

  it('streams actions', () => {
    const { reducer, ctx } = withUndoRedo(reduce, { maxUndo: 20 });
    const undo             = { type: 'UNDO' };
    const undoStream       = true;
    let updated;

    updated = reducer(state, { type: 'create-shape', x: 3, y: 3, w: 3, h: 3 });
    updated = reducer(updated, { type: 'create-shape', x: 9, y: 9, w: 9, h: 9 });
    updated = reducer(updated, { type: 'resize-shape', index: 0, w: 4, h: 4, undoStream });
    updated = reducer(updated, { type: 'resize-shape', index: 0, w: 5, h: 5, undoStream });
    updated = reducer(updated, { type: 'resize-shape', index: 0, w: 6, h: 6, undoStream });
    updated = reducer(updated, { type: 'resize-shape', index: 0, w: 7, h: 7, undoStream });
    updated = reducer(updated, { type: 'resize-ended' });

    expect(state.shapes.size).toBe(0);
    expect(updated.shapes.size).toBe(2);
    expect(updated.shapes.first()).toEqual({ x: 3, y: 3, w: 7, h: 7 });
    expect(ctx.undo.length).toBe(3);
    expect(ctx.redo.length).toBe(0);

    updated = reducer(updated, undo);

    expect(updated.shapes.first()).toEqual({ x: 3, y: 3, w: 3, h: 3 });
    expect(ctx.undo.length).toBe(2);
    expect(ctx.redo.length).toBe(1);
  });

  describe('keeps the correct amount of undoable states', () => {
    it('whole state', () => {
      const { reducer, ctx } = withUndoRedo(reduce, { maxUndo: 2 });
      const action           = { type: 'increment-count' };
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

    it('partial state', () => {
      const type    = 'add-message';
      const options = {
        setState: (saved, current) => current.set('messages', saved),
        getState: (current) => current.messages,
        maxUndo:  2
      };

      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, { type, message: 'a' });
      updated = reducer(updated, { type, message: 'b' });
      updated = reducer(updated, { type, message: 'c' });
      updated = reducer(updated, { type, message: 'd' });

      expect(state.messages.size).toBe(0);
      expect(updated.messages.size).toBe(4);
      expect(ctx.undo.length).toBe(2);
      expect(ctx.redo.length).toBe(0);

      const result   = ctx.undo.map((messages) => messages.toJS());
      const messages = [
        [ 'a', 'b' ],
        [ 'a', 'b', 'c' ]
      ];
      const plain = {
        messages: [ 'a', 'b', 'c', 'd' ],
        color:    'white',
        shapes:   [],
        count:    1
      };

      expect(updated.toJS()).toEqual(plain);
      expect(result).toEqual(messages);
    });
  });

  describe('keeps the correct amount of redoable states', () => {
    it('whole state', () => {
      const message          = { type: 'add-message', message: 'b' };
      const { reducer, ctx } = withUndoRedo(reduce, { maxUndo: 2 });
      const increment        = { type: 'increment-count' };
      const undo             = { type: 'UNDO' };
      let updated;

      updated = reducer(state, increment);   // count === 2
      updated = reducer(updated, increment); // count === 3
      updated = reducer(updated, increment); // count === 4
      updated = reducer(updated, message);   // count === 4
      updated = reducer(updated, increment); // count === 5
      updated = reducer(updated, undo);      // message removed
      updated = reducer(updated, undo);      // count === 4
      updated = reducer(updated, undo);      // count === 4
      updated = reducer(updated, undo);      // count === 4

      expect(state.count).toBe(1);
      expect(updated.count).toBe(4);
      expect(ctx.undo.length).toBe(0);
      expect(ctx.redo.length).toBe(2);

      const plain = {
        color:    'white',
        messages: [],
        shapes:   [],
        count:    4
      };

      expect(updated.toJS()).toEqual(plain);
    });

    it('partial state', () => {
      const undo    = { type: 'UNDO' };
      const type    = 'add-message';
      const options = {
        setState: (saved, current) => current.set('messages', saved),
        getState: (current) => current.messages,
        maxUndo:  2
      };

      const { reducer, ctx } = withUndoRedo(reduce, options);
      let updated;

      updated = reducer(state, { type, message: 'a' });
      updated = reducer(updated, { type, message: 'b' });
      updated = reducer(updated, { type: 'increment-count' });
      updated = reducer(updated, { type, message: 'c' });
      updated = reducer(updated, { type, message: 'd' });
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);
      updated = reducer(updated, undo);

      expect(state.messages.size).toBe(0);
      expect(updated.messages.size).toBe(2);
      expect(ctx.undo.length).toBe(0);
      expect(ctx.redo.length).toBe(2);

      const result   = ctx.redo.map((messages) => messages.toJS());
      const messages = [
        [ 'a', 'b', 'c', 'd' ],
        [ 'a', 'b', 'c' ]
      ];
      const plain = {
        messages: [ 'a', 'b' ],
        color:    'white',
        shapes:   [],
        count:    2
      };

      expect(updated.toJS()).toEqual(plain);
      expect(result).toEqual(messages);
    });
  });
});
