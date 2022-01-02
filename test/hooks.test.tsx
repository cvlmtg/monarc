import { createContainer, useDispatch } from '../src/index';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FunctionComponent } from 'react';
import { RecordOf, Record } from 'immutable';
import type { Action } from '../src/typings';

// ---------------------------------------------------------------------

type AppState = {
  count: number;
};

const reduce = (state: RecordOf<AppState>, action: Action): RecordOf<AppState> => {
  switch (action.type) {
    case 'increment':
      return state.set('count', state.count + 1);

    default:
      return state;
  }
};

const StateFactory = Record<AppState>({
  count: 0
});

// ---------------------------------------------------------------------

describe('the useDispatch hook', () => {
  let state: RecordOf<AppState>;

  beforeEach(() => {
    state = new StateFactory();
  });

  it('dispatches an action', async() => {
    const Container: FunctionComponent<{ store: RecordOf<AppState> }> = ({ store }) => {
      const dispatch = useDispatch();
      const onClick  = () => {
        dispatch({ type: 'increment' });
      };

      return (
        <button type="button" onClick={onClick}>
          COUNT {store.count}
        </button>
      );
    };

    const Component = createContainer(Container, reduce);

    render(<Component initialState={state} />);

    screen.getByText('COUNT 0');

    userEvent.click(screen.getByText('COUNT 0'));

    await screen.findByText('COUNT 1');
  });

  it('dispatches an asynchronous action', async() => {
    const Container: FunctionComponent<{ store: RecordOf<AppState> }> = ({ store }) => {
      const dispatch = useDispatch();
      const onClick  = () => {
        const promise = new Promise<Action>((resolve) => {
          setTimeout(() => {
            resolve({ type: 'increment' });
          }, 10);
        });

        dispatch(promise);
      };

      return (
        <button type="button" onClick={onClick}>
          COUNT {store.count}
        </button>
      );
    };

    const Component = createContainer(Container, reduce);

    render(<Component initialState={state} />);

    screen.getByText('COUNT 0');

    userEvent.click(screen.getByText('COUNT 0'));

    await screen.findByText('COUNT 1');
  });
});
