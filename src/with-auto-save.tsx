import type { Reducer, State, Action } from './typings';
import { useEffect, useState, useMemo } from 'react';
import { createPlugin } from './create-plugin';
import invariant from 'tiny-invariant';

// ---------------------------------------------------------------------

type SaveFunction = (state: State, callback?: () => void) => void;
type UpdateFunction = (
  previous: State,
  updated: State,
  action: Action,
  isTimerActive?: boolean
) => boolean;

type SaveOptions = {
  onBeforeUpdate?: UpdateFunction;
  onUpdate: UpdateFunction;
  onSave: SaveFunction;
  delay: number;
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

function save(ctx: InternalState, onSave: SaveFunction, onBeforeUpdate?: boolean): void {
  clearTimeout(ctx.timer);

  ctx.timer = null;

  if (onSave.length === 2) {
    onSave(ctx.state, () => {
      ctx.render();
    });
    return;
  }

  onSave(ctx.state);

  if (onBeforeUpdate !== true) {
    ctx.render();
  }
}

function wrapReducer(reduce: Reducer, ctx: InternalState, options: SaveOptions): Reducer {
  const SAVE  = save.bind(null, ctx, options.onSave);
  const NOW   = options.onBeforeUpdate;
  const LATER = options.onUpdate;
  const DELAY = options.delay;

  invariant(typeof options.onSave === 'function', 'missing onSave function');
  invariant(options.delay >= 0, 'invalid delay value');

  // initialize our state

  ctx.render = (): void => undefined;
  ctx.state  = null;
  ctx.timer  = null;

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (ctx.timer) {
        SAVE(true);
      }
    });
  }

  return function autoSave(state: State, action: Action): State {
    const updated = reduce(state, action);
    const timer   = ctx.timer !== null;
    let saveLater = false;
    let saveNow   = false;

    if (typeof NOW === 'function') {
      saveNow = NOW(state, updated, action, timer);
    }

    if (ctx.timer === null && saveNow === false) {
      saveLater = LATER(state, updated, action);
    }

    if (saveLater === true) {
      ctx.timer = setTimeout(SAVE, DELAY);
    }

    if (saveNow === true) {
      ctx.state = state;
      SAVE(true);
    }

    ctx.state = updated;

    return updated;
  };
}

function useValue(ctx: InternalState, options: SaveOptions): SaveContext {
  const [ counter, setCounter ] = useState(0);
  const isSaved = ctx.timer === null;

  // the little function below here is just a dirty trick to make this
  // component render when our timer expires and we have saved our data.
  // beware that we cannot call it inside the reducer, otherwise there
  // would be two components trying to render at the same time (this
  // component and the store container) and react doesn't like it...

  useEffect(() => {
    ctx.render = (): void => setCounter(counter + 1);
  }, [ counter ]); // eslint-disable-line

  // save our state on unmount if there's a timer active

  useEffect(() => {
    const onSave = options.onSave;

    return (): void => {
      ctx.render = (): void => undefined;

      if (ctx.timer) {
        save(ctx, onSave, true);
      }
    };
  }, []); // eslint-disable-line

  return useMemo(() => ({ isSaved }), [ isSaved ]);
}

const defaults = {
  onUpdate: (): boolean => true,
  delay:    5 * 1000
};

// ---------------------------------------------------------------------

const [ withAutoSave, useAutoSave, saveContext ] = createPlugin(wrapReducer, useValue, defaults);

export { withAutoSave, useAutoSave, saveContext };
