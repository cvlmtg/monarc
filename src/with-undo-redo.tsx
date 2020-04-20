import type { MaybeReducer, ReducerProvider, Reducer, State, Action } from './typings';
import { splitReducer, assembleReducer } from './utils';
import invariant from 'tiny-invariant';
import PropTypes from 'prop-types';
import React, {
  useContext, useMemo, createContext, Context,
  FunctionComponent
} from 'react';

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

type UserOptions = {
  setState?: RestoreFunction;
  getState?: RetrieveFuncion;
  undoAction?: string;
  redoAction?: string;
  maxUndo?: number;
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

function wrapReducer(reduce: Reducer, options: UndoOptions, ctx: InternalState): Reducer {
  const UNDO     = options.undoAction;
  const REDO     = options.redoAction;
  const RESTORE  = options.setState;
  const RETRIEVE = options.getState;
  const MAX_UNDO = options.maxUndo;

  return function undoRedo(state: State, action: Action): State {
    const stream  = action.undoStream === true && action.type === ctx.prev;
    const reset   = action.undoReset === true;
    const skip    = action.undoSkip === true;
    let retrieved: PS | undefined;
    let updated: State;
    let current: PS;

    switch (action.type) {
      case UNDO:
        if (ctx.undo.length === 0) {
          return state;
        }

        ctx.prev  = null;
        current   = RETRIEVE(state);
        retrieved = swap(current, ctx.undo, ctx.redo);

        if (typeof retrieved !== 'undefined') {
          return RESTORE(retrieved, state);
        }
        return state;

      case REDO:
        if (ctx.redo.length === 0) {
          return state;
        }

        ctx.prev  = null;
        current   = RETRIEVE(state);
        retrieved = swap(current, ctx.redo, ctx.undo);

        if (typeof retrieved !== 'undefined') {
          return RESTORE(retrieved, state);
        }
        return state;

      default:
        updated = reduce(state, action);

        if (!skip && !reset && !stream) {
          retrieved = RETRIEVE(updated);
          current   = RETRIEVE(state);

          if (current !== retrieved) {
            if (MAX_UNDO && MAX_UNDO === ctx.undo.length) {
              ctx.undo.shift();
            }
            ctx.undo.push(current);
            ctx.redo = [];
          }
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

export function withUndoRedo(maybeReducer: MaybeReducer, options: UserOptions = {}): ReducerProvider {
  const [ reducer, Provider ] = splitReducer(maybeReducer);

  const opts: UndoOptions = {
    setState:   defaultGetSet,
    getState:   defaultGetSet,
    undoAction: 'UNDO',
    redoAction: 'REDO',
    maxUndo:    50,
    ...options
  };

  const ctx: InternalState = {
    prev: null,
    undo: [],
    redo: []
  };

  // the user can't supply only one function for getState / setState,
  // that's probably an error

  const get  = opts.getState === defaultGetSet;
  const set  = opts.setState === defaultGetSet;
  const both = get === false && set === false;
  const none = get === true && set === true;

  invariant(opts.maxUndo >= 0, 'invalid maxUndo value');
  invariant(opts.undoAction, 'invalid undoAction value');
  invariant(opts.redoAction, 'invalid redoAction value');
  invariant(none || both, 'you must supply both getState and setState');
  invariant(typeof opts.getState === 'function', 'missing getState function');
  invariant(typeof opts.setState === 'function', 'missing setState function');
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
