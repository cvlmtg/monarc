import { createContainer, withUndoRedo, useDispatch } from '../src/index';
import { fireEvent, render, act } from '@testing-library/react';
import React, { useCallback } from 'react';
import { Record } from 'immutable';

// ---------------------------------------------------------------------
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const reduce = (state, action) => {
  switch (action.type) {
    case 'increment-count':
      return state.set('count', state.count + 1);

    default:
      return state;
  }
};

const Container = ({ store }) => {
  const dispatch  = useDispatch();
  const increment = useCallback(() => {
    dispatch({ type: 'increment-count' });
  }, [ dispatch ]);

  return (
    <button type="button" onClick={increment}>
      INCREMENT: {store.count}
    </button>
  );
};

const State = new Record({
  count: 0
});

// ---------------------------------------------------------------------

describe('the createContainer constructor', () => {
  let state;

  beforeEach(() => {
    state = new State();
  });

  it('accepts a single reducer or an array of reducers', () => {
    const validArg   = () => createContainer('div', [ reduce ]);
    const stillValid = () => createContainer('div', reduce);

    expect(stillValid).not.toThrow();
    expect(validArg).not.toThrow();
  });

  it('accepts a wrapped reducer', () => {
    const undo     = withUndoRedo(reduce);
    const validArg = () => createContainer('div', undo);

    expect(validArg).not.toThrow();
  });

  it('rejects invalid reducers', () => {
    const emptyArr = () => createContainer('div', []);
    const wrongObj = () => createContainer('div', {});
    const noArg    = () => createContainer('div');

    expect(emptyArr).toThrow();
    expect(wrongObj).toThrow();
    expect(noArg).toThrow();
  });

  it('creates a working container', () => {
    const Component = createContainer(Container, reduce);
    const button    = /INCREMENT/u;

    const { queryByText, getByText } = render(
      <Component initialState={state} />
    );

    expect(queryByText('INCREMENT: 0')).toBeTruthy();

    fireEvent.click(getByText(button));

    expect(queryByText('INCREMENT: 1')).toBeTruthy();
  });

  it('create a flux dispatcher', () => {
    const dispatcher = { dispatch: null };
    const Component  = createContainer(Container, reduce, dispatcher);

    const { queryByText } = render(
      <Component initialState={state} />
    );

    expect(queryByText('INCREMENT: 0')).toBeTruthy();

    act(() => {
      dispatcher.dispatch({ type: 'increment-count' });
    });

    expect(queryByText('INCREMENT: 1')).toBeTruthy();
  });
});
