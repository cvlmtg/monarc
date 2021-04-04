import { Context, useEffect, useState, useMemo } from 'react';
import { createPlugin } from './create-plugin';
import invariant from 'tiny-invariant';

// ---------------------------------------------------------------------

type SaveFn = (state: any, callback?: () => void) => void;

type UpdateFn = (
  previous: any,
  updated: any,
  action: Action,
  isTimerActive?: boolean
) => boolean;

type SaveOpts = {
  onBeforeUpdate?: UpdateFn;
  onUpdate: UpdateFn;
  onSave: SaveFn;
  delay: number;
};

type SaveState = {
  state: unknown | null;
  timer: number | null;
  render: () => void;
};

type SaveCtx = {
  isSaved: boolean;
};

// ---------------------------------------------------------------------

function save(ps: SaveState, onSave: SaveFn, onBeforeUpdate?: boolean) {
  if (ps.timer !== null) {
    clearTimeout(ps.timer);
    ps.timer = null;
  }

  if (ps.state === null) {
    return;
  }

  if (onSave.length === 2) {
    onSave(ps.state, () => {
      ps.render();
    });
    return;
  }

  onSave(ps.state);

  if (onBeforeUpdate !== true) {
    ps.render();
  }
}

function wrapReducer(
  reduce: Reducer<any, any>,
  ps: Partial<SaveState>,
  options: SaveOpts
): Reducer<any, any> {
  invariant(typeof options.onSave === 'function', 'missing onSave function');
  invariant(options.delay >= 0, 'invalid delay value');

  // initialize our state

  ps.render = (): void => undefined;
  ps.state  = null;
  ps.timer  = null;

  const PS    = ps as SaveState;
  const DELAY = options.delay;
  const LATER = options.onUpdate;
  const NOW   = options.onBeforeUpdate;
  const SAVE  = save.bind(null, PS, options.onSave);

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (PS.timer !== null) {
        SAVE(true);
      }
    });
  }

  return function autoSave(state: any, action: Action): any {
    const updated = reduce(state, action);
    const timer   = PS.timer !== null;
    let saveLater = false;
    let saveNow   = false;

    if (typeof NOW === 'function') {
      saveNow = NOW(state, updated, action, timer);
    }

    if (PS.timer === null && saveNow === false) {
      saveLater = LATER(state, updated, action);
    }

    if (saveLater === true) {
      PS.timer = setTimeout(SAVE, DELAY);
    }

    if (saveNow === true) {
      PS.state = state;
      SAVE(true);
    }

    PS.state = updated;

    return updated;
  };
}

function useValue(ps: Partial<SaveState>, options: SaveOpts): SaveCtx {
  const [ counter, setCounter ] = useState(0);

  const PS      = ps as SaveState;
  const isSaved = PS.timer === null;

  // the little function below here is just a dirty trick to make this
  // component render when our timer expires and we have saved our data.
  // beware that we cannot call it inside the reducer, otherwise there
  // would be two components trying to render at the same time (this
  // component and the store container) and react doesn't like it...

  useEffect(() => {
    PS.render = (): void => setCounter(counter + 1);
  }, [ counter ]); // eslint-disable-line

  // save our state on unmount if there's a timer active

  useEffect(() => {
    const onSave = options.onSave;

    return (): void => {
      PS.render = (): void => undefined;

      if (PS.timer) {
        save(PS, onSave, true);
      }
    };
  }, []); // eslint-disable-line

  return useMemo(() => ({ isSaved }), [ isSaved ]);
}

const defaults = {
  onUpdate: () => true,
  delay:    5 * 1000
};

// ---------------------------------------------------------------------

const [ withAutoSave, useAutoSave, saveContext ]
  : [ WithPlugin<any, SaveOpts>, UsePlugin<SaveCtx>, Context<SaveCtx> ]
  = createPlugin(wrapReducer, useValue, defaults);

export { withAutoSave, useAutoSave, saveContext };
