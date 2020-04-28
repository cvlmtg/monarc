import type { MaybeReducer, ReducerProvider, Reducer, State, Action } from './typings';
import type { EnhancerOptions } from 'redux-devtools-extension';
import React, { useEffect, FunctionComponent } from 'react';
import { useDispatch, useStore } from './create-container';
import { splitReducer, assembleReducer } from './utils';
import { Reviver, parse } from 'jsan';
import PropTypes from 'prop-types';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

// options object gets mutated in place when we call connect()...
type MutatedOptions = EnhancerOptions & { serialize: { reviver: Reviver } };

type InternalState = {
  send: (action: Action, state: State) => void;
  init: (state: State) => void;
  initial: State | null;
}

interface Message extends Action {
  payload: { type: string };
  state: State;
}

// ---------------------------------------------------------------------

const TIMETRAVELLING = '__REDUX_DEVTOOLS_DISPATCH__';

const installed: boolean =
  typeof window !== 'undefined' &&
  Boolean(window.__REDUX_DEVTOOLS_EXTENSION__);

function wrapReducer(reduce: Reducer, ctx: InternalState): Reducer {
  return function devTools(state: State, action: Action): State {
    const _action = action as Message;
    let updated;

    if (_action.type !== TIMETRAVELLING) {
      updated = reduce(state, action);

      ctx.send(action, updated);
      return updated;
    }

    switch (_action.payload.type) {
      case 'COMMIT':
        updated = reduce(state, action);

        ctx.init(updated);
        break;

      case 'ROLLBACK':
        updated = _action.state;

        ctx.init(updated);
        break;

      case 'RESET':
        updated = ctx.initial;

        ctx.init(updated);
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

// ---------------------------------------------------------------------

export function withDevTools(maybeReducer: MaybeReducer, options: EnhancerOptions = {}): ReducerProvider {
  if (installed === false) {
    return maybeReducer as ReducerProvider;
  }

  const [ reducer, Provider ] = splitReducer(maybeReducer);

  const ctx: InternalState = {
    send:    () => undefined,
    init:    () => undefined,
    initial: null
  };

  const DevToolsProvider: FunctionComponent = ({ children }) => {
    const dispatch = useDispatch();
    const store    = useStore();

    useEffect(() => {
      if (dispatch === null) {
        return undefined;
      }

      const extension   = window.__REDUX_DEVTOOLS_EXTENSION__;
      const devtools    = extension.connect(options);
      const unsubscribe = devtools.subscribe((message: Message) => {
        if (message.type === 'DISPATCH') {
          const mutated = options as MutatedOptions;
          const state   = parse(message.state, mutated.serialize.reviver);
          const action  = {
            type:    TIMETRAVELLING,
            payload: message.payload,
            state
          };

          dispatch(action as Action);
        }
      });

      ctx.send    = devtools.send;
      ctx.init    = devtools.init;
      ctx.initial = store;

      devtools.init(store);

      return (): void => {
        unsubscribe();
        extension.disconnect();
      };
    }, [ dispatch ]); // eslint-disable-line

    return (
      <Provider>{children}</Provider>
    );
  };

  DevToolsProvider.propTypes = {
    children: PropTypes.node
  };

  const wrapped = wrapReducer(reducer, ctx);

  return assembleReducer(wrapped, DevToolsProvider, ctx);
}
