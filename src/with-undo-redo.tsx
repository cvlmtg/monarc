import type { Reducer, State, Action } from './typings';
import { createPlugin } from './plugin';
import invariant from 'tiny-invariant';
import { useMemo } from 'react';

// ---------------------------------------------------------------------

type RestoreFunction = (previous: State, current: State) => State;
type RetrieveFuncion = (state: State) => PS;
type PS = Partial<State>;

type UndoOptions = {
  setState: RestoreFunction;
  getState: RetrieveFuncion;
  undoAction: string;
  redoAction: string;
  maxUndo: number;
}

type InternalState = {
  prev: string | null;
  undo: Array<object>;
  redo: Array<object>;
}

type UndoContext = {
  canUndo: boolean;
  canRedo: boolean;
}

// ---------------------------------------------------------------------

function defaultGetSet(state: State): State {
  return state;
}

function swap(current: PS, from: Array<PS>, to: Array<PS>): PS | undefined {
  const popped: PS | undefined = from.pop();

  if (typeof popped !== 'undefined') {
    to.push(current);
  }
  return popped;
}

function wrapReducer(reduce: Reducer, ctx: InternalState, options: UndoOptions): Reducer {
  const get  = options.getState === defaultGetSet;
  const set  = options.setState === defaultGetSet;
  const both = get === false && set === false;
  const none = get === true && set === true;

  // the user can't supply only one function for getState / setState,
  // that's probably an error

  invariant(reduce.name !== 'autoSave', 'cannot call withAutoSave before withUndoRedo');
  invariant(typeof options.getState === 'function', 'missing getState function');
  invariant(typeof options.setState === 'function', 'missing setState function');
  invariant(none || both, 'you must supply both getState and setState');
  invariant(options.undoAction, 'invalid undoAction value');
  invariant(options.redoAction, 'invalid redoAction value');
  invariant(options.maxUndo >= 0, 'invalid maxUndo value');

  const UNDO     = options.undoAction;
  const REDO     = options.redoAction;
  const RESTORE  = options.setState;
  const RETRIEVE = options.getState;
  const MAX_UNDO = options.maxUndo;

  return function undoRedo(state: State, action: Action): State {
    const stream = action.undoStream === true && action.type === ctx.prev;
    const reset  = action.undoReset === true;
    const skip   = action.undoSkip === true;
    let next: PS | undefined;
    let updated: State;
    let current: PS;

    switch (action.type) {
      case UNDO:
        if (ctx.undo.length === 0) {
          return state;
        }

        ctx.prev = null;
        current  = RETRIEVE(state);
        next     = swap(current, ctx.undo, ctx.redo);

        if (typeof next !== 'undefined') {
          return RESTORE(next, state);
        }
        return state;

      case REDO:
        if (ctx.redo.length === 0) {
          return state;
        }

        ctx.prev = null;
        current  = RETRIEVE(state);
        next     = swap(current, ctx.redo, ctx.undo);

        if (typeof next !== 'undefined') {
          return RESTORE(next, state);
        }
        return state;

      default:
        updated = reduce(state, action);

        if (skip === false && reset === false && stream === false) {
          next    = RETRIEVE(updated);
          current = RETRIEVE(state);

          if (current !== next) {
            if (MAX_UNDO && MAX_UNDO === ctx.undo.length) {
              ctx.undo.shift();
            }
            ctx.undo.push(current);
            ctx.redo = [];
          }
        }

        if (reset === true) {
          ctx.undo = [];
          ctx.redo = [];
        }

        ctx.prev = action.type;
        break;
    }

    return updated;
  };
}

function useSetup(ctx: InternalState): UndoContext {
  const canUndo = ctx.undo.length !== 0;
  const canRedo = ctx.redo.length !== 0;
  const value   = useMemo(() => ({ canUndo, canRedo }), [ canUndo, canRedo ]);

  return value;
}

const defaults = {
  setState:   defaultGetSet,
  getState:   defaultGetSet,
  undoAction: 'UNDO',
  redoAction: 'REDO',
  maxUndo:    50
};

const ctx: InternalState = {
  prev: null,
  undo: [],
  redo: []
};

// ---------------------------------------------------------------------

const { withPlugin, context, useHook } = createPlugin({
  wrapReducer,
  useSetup,
  defaults,
  ctx
});

export {
  withPlugin as withUndoRedo,
  context as undoContext,
  useHook as useUndoRedo
};
