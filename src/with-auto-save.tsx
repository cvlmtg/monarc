import type { MaybeReducer, ReducerProvider, Reducer, State, Action } from './types';
import { splitReducer, assembleReducer } from './utils';
import invariant from 'tiny-invariant';
import PropTypes from 'prop-types';
import React, {
  useContext, useEffect, useState, useMemo,
  createContext, Context,
  FunctionComponent
} from 'react';

// ---------------------------------------------------------------------

type UpdateFunction = (previous: State, updated: State, action: Action) => boolean;
type SaveFunction = (state: State, callback?: () => void) => void;

type SaveOptions = {
  onBeforeUpdate?: UpdateFunction;
  onUpdate: UpdateFunction;
  onSave: SaveFunction;
  delay: number;
}

type UserOptions = {
  onBeforeUpdate?: UpdateFunction;
  onUpdate?: UpdateFunction;
  onSave: SaveFunction;
  delay?: number;
}

type InternalState = {
  render: () => void;
  state: object | null;
  timer: any;
}

type SaveContext = {
  isSaved: boolean;
}

// ---------------------------------------------------------------------

function save(ctx: InternalState, onSave: SaveFunction): void {
  ctx.timer = null;

  if (onSave.length === 2) {
    onSave(ctx.state, ctx.render);
    return;
  }

  onSave(ctx.state);
  ctx.render();
}

function wrapReducer(reduce: Reducer, options: SaveOptions, ctx: InternalState): Reducer {
  const BEFORE  = options.onBeforeUpdate;
  const UPDATE  = options.onUpdate;
  const SAVE    = options.onSave;
  const DELAY   = options.delay;
  let installed = false;

  return function autoSave(state: State, action: Action): State {
    const doSave  = save.bind(null, ctx, SAVE);
    const updated = reduce(state, action);
    let saveLater = false;
    let saveNow   = false;

    if (installed === false && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (ctx.timer) {
          clearTimeout(ctx.timer);
          doSave();
        }
      });

      installed = true;
    }

    if (ctx.state !== null && typeof BEFORE === 'function') {
      saveNow = BEFORE(state, updated, action);
    }

    if (ctx.timer === null && saveNow === false) {
      saveLater = UPDATE(state, updated, action);
    }

    if (saveLater === true) {
      ctx.timer = setTimeout(doSave, DELAY);
    }

    if (saveNow === true) {
      clearTimeout(ctx.timer);
      doSave();
    }
    ctx.state = updated;

    return updated;
  };
}

// ---------------------------------------------------------------------

export const saveContext: Context<SaveContext> = createContext<SaveContext>({
  isSaved: false
});

export function useAutoSave(): SaveContext {
  return useContext(saveContext);
}

export function withAutoSave(maybeReducer: MaybeReducer, options: UserOptions): ReducerProvider {
  const [ reducer, Provider ] = splitReducer(maybeReducer);

  const opts: SaveOptions = {
    onUpdate: () => true,
    delay:    5 * 1000,
    ...options
  };

  const ctx: InternalState = {
    render: () => undefined,
    state:  null,
    timer:  null
  };

  invariant(opts.delay >= 0, 'invalid delay value');
  invariant(typeof opts.onSave === 'function', 'missing onSave function');

  const AutoSaveProvider: FunctionComponent = ({ children }) => {
    const [ counter, setCounter ] = useState(0);

    const isSaved = ctx.timer === null;
    const value   = useMemo(() => ({ isSaved }), [ isSaved ]);

    // the little function below here is just a dirty trick to make this
    // component render when our timer expires and we have saved our data.
    // beware that we cannot call it inside the reducer, otherwise there
    // would be two components trying to render (this component and the
    // store container) and react doesn't like it...

    useEffect(() => {
      ctx.render = (): void => setCounter(counter + 1);
    }, [ counter ]);

    return (
      <saveContext.Provider value={value}>
        <Provider>
          {children}
        </Provider>
      </saveContext.Provider>
    );
  };

  AutoSaveProvider.propTypes = {
    children: PropTypes.node
  };

  const wrapped = wrapReducer(reducer, opts, ctx);

  return assembleReducer(wrapped, AutoSaveProvider, ctx);
}
