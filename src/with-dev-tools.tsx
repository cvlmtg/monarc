import type { EnhancerOptions } from 'redux-devtools-extension';
import type { Action, Reducer } from './typings';
import type Immutable from 'immutable';

import { immutable } from '@redux-devtools/serialize';
import { useDispatch, useStore } from './context';
import { createPlugin } from './create-plugin';
import { useEffect } from 'react';
import jsan from 'jsan';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

type ImmutableOpts = EnhancerOptions & {
  serialize: {
    refs: (new (data: any) => unknown)[];
    immutable: typeof Immutable;
  }
};

type DevState = {
  send: (action: Action, state: any) => void;
  init: (state: any) => void;
  initial: any | null;
}

interface Message extends Action {
  payload: { type: string };
  state: any;
}

const TIME_TRAVEL = '__REDUX_DEVTOOLS_DISPATCH__';
const defaults    = { serialize: true };

// ---------------------------------------------------------------------

function wrapReducer(
  reduce: Reducer<any, Action>,
  ps: Partial<DevState>
): Reducer<any, Action> {
  ps.send    = () => undefined;
  ps.init    = () => undefined;
  ps.initial = null;

  return function devTools(state: any, action: Action): any {
    const _action = action as Message;
    const _ps     = ps as DevState;
    let updated;

    if (_action.type !== TIME_TRAVEL) {
      updated = reduce(state, action);

      _ps.send(action, updated);

      return updated;
    }

    switch (_action.payload.type) {
      case 'COMMIT':
        updated = reduce(state, action);

        _ps.init(updated);
        break;

      case 'ROLLBACK':
        updated = _action.state;

        _ps.init(updated);
        break;

      case 'RESET':
        updated = ps.initial;

        _ps.init(updated);
        break;

      case 'JUMP_TO_ACTION':
      case 'JUMP_TO_STATE':
        updated = _action.state;
        break;

      default:
        updated = state;
        break;
    }

    return updated;
  };
}

function useValue(ps: Partial<DevState>, options: ImmutableOpts): void {
  const dispatch = useDispatch();
  const store    = useStore();

  useEffect(() => {
    const installed = typeof window !== 'undefined'
      && Boolean(window.__REDUX_DEVTOOLS_EXTENSION__);

    if (installed === false) {
      return () => null;
    }

    const serialize = options.serialize;
    const extension = window.__REDUX_DEVTOOLS_EXTENSION__;
    const devtools  = extension.connect({ ...defaults, ...options });
    let parse: (state: string) => any;

    if (serialize.immutable) {
      const serializer = immutable(serialize.immutable, serialize.refs);

      parse = serializer.parse;
    } else {
      parse = jsan.parse;
    }

    const unsubscribe = devtools.subscribe((message: Message) => {
      if (message.type === 'DISPATCH') {
        const state  = parse(message.state);
        const action = {
          type:    TIME_TRAVEL,
          payload: message.payload,
          state
        };

        dispatch(action);
      }
    });

    ps.send    = devtools.send;
    ps.init    = devtools.init;
    ps.initial = store;

    devtools.init(store);

    return () => {
      unsubscribe();
      extension.disconnect();
    };
  }, []); // eslint-disable-line
}

// ---------------------------------------------------------------------

const [ withDevTools ] = createPlugin(wrapReducer, useValue);

export { withDevTools };
