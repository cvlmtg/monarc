import { createPlugin } from './create-plugin';
import { Context, useMemo } from 'react';
import invariant from 'tiny-invariant';
import type {
  Action, Reducer, UsePlugin, WithPlugin
} from './typings';

// ---------------------------------------------------------------------

type UndoOpts = {
  setState: (previous: any, current: any) => any;
  getState: (state: any) => any;
  undoAction: string;
  redoAction: string;
  maxUndo: number;
};

export type UndoState = {
  prev: string | null;
  undo: Array<any>;
  redo: Array<any>;
};

type UndoCtx = {
  canUndo: boolean;
  canRedo: boolean;
};

// ---------------------------------------------------------------------

function swap(current: any, from: Array<any>, to: Array<any>): any | undefined {
  const popped = from.pop();

  if (typeof popped !== 'undefined') {
    to.push(current);
  }

  return popped;
}

function defaultGetSet(state: any): any {
  return state;
}

function wrapReducer(
  reduce: Reducer<any, any>,
  ps: Partial<UndoState>,
  options: UndoOpts
): Reducer<any, any> {
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

  // initialize our state

  ps.prev = null;
  ps.undo = [];
  ps.redo = [];

  const PS       = ps as UndoState;
  const MAX_UNDO = options.maxUndo;
  const SET      = options.setState;
  const GET      = options.getState;
  const UNDO     = options.undoAction;
  const REDO     = options.redoAction;

  return function undoRedo(state: any, action: Action): any {
    const stream = action.undoStream === true && action.type === PS.prev;
    const reset  = action.undoReset === true;
    const skip   = action.undoSkip === true;
    let next: any | undefined;
    let updated: any;
    let current: any;

    switch (action.type) {
      case UNDO:
        if (PS.undo.length === 0) {
          return state;
        }

        PS.prev = null;
        current  = GET(state);
        next     = swap(current, PS.undo, PS.redo);

        if (typeof next !== 'undefined') {
          return SET(next, state);
        }
        return state;

      case REDO:
        if (PS.redo.length === 0) {
          return state;
        }

        PS.prev = null;
        current  = GET(state);
        next     = swap(current, PS.redo, PS.undo);

        if (typeof next !== 'undefined') {
          return SET(next, state);
        }
        return state;

      default:
        updated = reduce(state, action);

        if (skip === false && reset === false && stream === false) {
          next    = GET(updated);
          current = GET(state);

          if (current !== next) {
            if (MAX_UNDO && MAX_UNDO === PS.undo.length) {
              PS.undo.shift();
            }
            PS.undo.push(current);
            PS.redo = [];
          }
        }

        if (reset === true) {
          PS.undo = [];
          PS.redo = [];
        }

        PS.prev = action.type;
        break;
    }

    return updated;
  };
}

function useValue(ps: Partial<UndoState>): UndoCtx {
  const PS      = ps as UndoState;
  const canUndo = PS.undo.length !== 0;
  const canRedo = PS.redo.length !== 0;

  return useMemo(() => ({ canUndo, canRedo }), [ canUndo, canRedo ]);
}

const defaults = {
  setState:   defaultGetSet,
  getState:   defaultGetSet,
  undoAction: 'UNDO',
  redoAction: 'REDO',
  maxUndo:    50
};

// ---------------------------------------------------------------------

const [ withUndoRedo, useUndoRedo, undoContext ]
  : [ WithPlugin<any, UndoOpts, Action>, UsePlugin<UndoCtx>, Context<UndoCtx> ]
  = createPlugin(wrapReducer, useValue, defaults);

export { withUndoRedo, useUndoRedo, undoContext };
