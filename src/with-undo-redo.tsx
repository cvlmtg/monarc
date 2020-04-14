import type { MaybeReducer, ReducerProvider, Reducer, State, Action } from './types';
import { splitReducer, assembleReducer } from './utils';
import invariant from 'tiny-invariant';
import PropTypes from 'prop-types';
import React, {
  useContext, useMemo, createContext, Context,
  FunctionComponent
} from 'react';

// ---------------------------------------------------------------------

type UndoOptions = {
  undoAction: string;
  redoAction: string;
  stateKey: string | null;
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

function move(state: State, key: string | null, from: Array<State>, to: Array<State>): State {
  const popped: State | undefined = from.pop();
  let updated: State;
  let saved: State;

  if (typeof popped === 'undefined') {
    return state;
  }

  if (key) {
    updated = state.set(key, popped);
    saved   = state.get(key);
  } else {
    updated = popped;
    saved   = state;
  }
  to.push(saved);

  return updated;
}

function wrapReducer(reduce: Reducer, options: UndoOptions, ctx: InternalState): Reducer {
  const UNDO     = options.undoAction;
  const REDO     = options.redoAction;
  const KEY      = options.stateKey;
  const MAX_UNDO = options.maxUndo;

  return function undoRedo(state: State, action: Action): State {
    const stream = action.undoStream === true && action.type === ctx.prev;
    const reset  = action.undoReset === true;
    const skip   = action.undoSkip === true;
    let updated: State;
    let u: State;
    let s: State;

    switch (action.type) {
      case UNDO:
        if (ctx.undo.length !== 0) {
          updated  = move(state, KEY, ctx.undo, ctx.redo);
          ctx.prev = null;

          return updated;
        }
        return state;

      case REDO:
        if (ctx.redo.length !== 0) {
          updated  = move(state, KEY, ctx.redo, ctx.undo);
          ctx.prev = null;

          return updated;
        }
        return state;

      default:
        updated = reduce(state, action);

        u = KEY ? updated.get(KEY) : updated;
        s = KEY ? state.get(KEY) : state;

        if (u !== s && !skip && !reset && !stream) {
          if (MAX_UNDO && MAX_UNDO === ctx.undo.length) {
            ctx.undo.shift();
          }
          ctx.undo.push(s);
          ctx.redo = [];
        }

        if (reset) {
          ctx.undo = [];
          ctx.redo = [];
        }

        ctx.prev = action.type;
        break;
    }

    return updated;
  };
}

// ---------------------------------------------------------------------

export const undoContext: Context<UndoContext> = createContext<UndoContext>({
  canUndo: false,
  canRedo: false
});

export function useUndoRedo(): UndoContext {
  return useContext(undoContext);
}

export function withUndoRedo(maybeReducer: MaybeReducer, options = {}): ReducerProvider {
  const [ reducer, Provider ] = splitReducer(maybeReducer);

  const opts: UndoOptions = {
    undoAction: 'UNDO',
    redoAction: 'REDO',
    stateKey:   null,
    maxUndo:    50,
    ...options
  };

  const ctx: InternalState = {
    prev: null,
    undo: [],
    redo: []
  };

  invariant(opts.maxUndo >= 0, 'invalid maxUndo value');
  invariant(opts.undoAction, 'invalid undoAction value');
  invariant(opts.redoAction, 'invalid redoAction value');
  invariant(reducer.name !== 'autoSave', 'cannot call withAutoSave before withUndoRedo');

  const UndoRedoProvider: FunctionComponent = ({ children }) => {
    const canUndo = ctx.undo.length !== 0;
    const canRedo = ctx.redo.length !== 0;
    const value   = useMemo(() => ({ canUndo, canRedo }), [ canUndo, canRedo ]);

    return (
      <undoContext.Provider value={value}>
        <Provider>
          {children}
        </Provider>
      </undoContext.Provider>
    );
  };

  UndoRedoProvider.propTypes = {
    children: PropTypes.node
  };

  const wrapped = wrapReducer(reducer, opts, ctx);

  return assembleReducer(wrapped, UndoRedoProvider, ctx);
}
