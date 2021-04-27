import { withAutoSave, withUndoRedo } from '../src/index';
import { RecordOf, Record } from 'immutable';

// ---------------------------------------------------------------------

interface AppState {
  count: number;
}

function reduce(state: RecordOf<AppState>, action: Action): RecordOf<AppState> {
  switch (action.type) {
    case 'increment-count':
      return state.set('count', state.count + 1);

    default:
      return state;
  }
}

const AppState = Record<AppState>({
  count: 1
});

// ---------------------------------------------------------------------

describe('the withAutoSave plugin', () => {
  let state: RecordOf<AppState>;

  beforeEach(() => {
    state = new AppState();
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

    expect(emptyArr).toThrow();
  });

  it('extends a wrapped reducer', () => {
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

    let updated: RecordOf<AppState> | null = null;

    const { reducer, ps } = withAutoSave(reduce, {
      onSave: (saving: RecordOf<AppState>) => {
        const check = updated as RecordOf<AppState>;
        const PS    = ps as PluginState;

        expect(state.count).toBe(1);
        expect(saving.count).toBe(2);
        expect(check.count).toBe(2);
        expect(updated).toBe(saving);
        expect(PS.timer).toBe(null);
        done();
      },
      delay: 0
    });

    updated = reducer(state, action);

    const PS = ps as PluginState;

    expect(PS.timer).not.toBe(null);
  });

  it("doesn't start the timer if it's already running", (done) => {
    const action = { type: 'increment-count' };

    let updated: RecordOf<AppState> | null = null;

    const { reducer } = withAutoSave(reduce, {
      onSave: (saving: RecordOf<AppState>) => {
        const check = updated as RecordOf<AppState>;

        expect(state.count).toBe(1);
        expect(saving.count).toBe(3);
        expect(check.count).toBe(3);
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

    let updated: RecordOf<AppState> | null = null;

    const { reducer, ps } = withAutoSave(reduce, {
      onBeforeUpdate: () => true,
      onUpdate:       () => true,
      onSave:         (saving: RecordOf<AppState>) => {
        expect(state.count).toBe(1);
        expect(saving.count).toBe(1);
        expect(updated).toBe(null);
        done();
      },
      delay: 100
    });

    updated = reducer(state, action) as RecordOf<AppState>;

    const PS = ps as PluginState;

    expect(PS.timer).toBe(null);
    expect(updated.count).toBe(2);
  });

  it('handles both onUpdate and onBeforeUpdate', (done) => {
    const action = { type: 'increment-count' };
    let before   = false;
    let updated  = null;

    const { reducer } = withAutoSave(reduce, {
      onBeforeUpdate: (prev: RecordOf<AppState>) => prev.count % 3 === 0,
      onUpdate:       () => true,
      onSave:         (saving: RecordOf<AppState>) => {
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

  it('renders when saving asynchronous (onUpdate)', (done) => {
    const action = { type: 'increment-count' };
    const spy    = jest.fn(() => undefined);
    let updated  = null;

    const { reducer, ps } = withAutoSave(reduce, {
      onSave: (saving: RecordOf<AppState>) => {
        expect(state.count).toBe(1);
        expect(saving.count).toBe(2);

        setTimeout(() => {
          expect(spy.mock.calls.length).toBe(1);
          done();
        }, 0);
      },
      delay: 0
    });

    const PS = ps as PluginState;

    PS.render = spy;
    updated    = reducer(state, action);

    expect(updated.count).toBe(2);
  });

  it('renders when saving asynchronous (onBeforeUpdate)', (done) => {
    const action = { type: 'increment-count' };
    const spy    = jest.fn(() => undefined);

    let updated: RecordOf<AppState> | null = null;

    const { reducer, ps } = withAutoSave(reduce, {
      onBeforeUpdate: () => true,
      onUpdate:       () => true,
      onSave:         (saving: RecordOf<AppState>, callback?) => {
        expect(state.count).toBe(1);
        expect(saving.count).toBe(1);
        expect(updated).toBe(null);
        expect(typeof callback).toBe('function');

        if (callback) {
          callback();
        }

        setTimeout(() => {
          expect(spy.mock.calls.length).toBe(1);
          done();
        }, 0);
      },
      delay: 100
    });

    const PS = ps as PluginState;

    PS.render = spy;
    updated    = reducer(state, action) as RecordOf<AppState>;

    expect(updated.count).toBe(2);
  });

  it("doesn't render when saving immediatel (onBeforeUpdate)y", (done) => {
    const action = { type: 'increment-count' };
    const spy    = jest.fn(() => undefined);

    let updated: RecordOf<AppState> | null = null;

    const { reducer, ps } = withAutoSave(reduce, {
      onBeforeUpdate: () => true,
      onUpdate:       () => true,
      onSave:         (saving: RecordOf<AppState>) => {
        expect(state.count).toBe(1);
        expect(saving.count).toBe(1);
        expect(updated).toBe(null);

        setTimeout(() => {
          expect(spy.mock.calls.length).toBe(0);
          done();
        }, 0);
      },
      delay: 100
    });

    const PS = ps as PluginState;

    PS.render = spy;
    updated    = reducer(state, action) as RecordOf<AppState>;

    expect(updated.count).toBe(2);
  });
});
