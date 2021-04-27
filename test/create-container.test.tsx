import { createContainer, withUndoRedo, useDispatch } from '../src/index';
import { fireEvent, render, act } from '@testing-library/react';
import React, { ComponentType, useCallback } from 'react';

// ---------------------------------------------------------------------

function reduce(state: number, action: Action): number {
  switch (action.type) {
    case 'increment-count':
      return state + 1;

    default:
      return state;
  }
}

const TestComponent: ComponentType<{ store: number }> = ({ store }) => {
  const dispatch  = useDispatch();
  const increment = useCallback(() => {
    dispatch({ type: 'increment-count' });
  }, [ dispatch ]);

  return (
    <button type="button" onClick={increment}>
      INCREMENT: {store}
    </button>
  );
};

// ---------------------------------------------------------------------

describe('the createContainer constructor', () => {
  let state: number;

  beforeEach(() => {
    state = 0;
  });

  it('accepts a single reducer or an array of reducers', () => {
    const validArg   = () => createContainer(TestComponent, [ reduce ]);
    const stillValid = () => createContainer(TestComponent, reduce);

    expect(stillValid).not.toThrow();
    expect(validArg).not.toThrow();
  });

  it('accepts a wrapped reducer', () => {
    const undo     = withUndoRedo(reduce);
    const validArg = () => createContainer(TestComponent, undo);

    expect(validArg).not.toThrow();
  });

  it('rejects invalid reducers', () => {
    const emptyArr = () => createContainer(TestComponent, []);

    expect(emptyArr).toThrow();
  });

  it('creates a working container', () => {
    const Container = createContainer(TestComponent, reduce);
    const button    = /INCREMENT/u;

    const { queryByText, getByText } = render(
      <Container initialState={state} />
    );

    expect(queryByText('INCREMENT: 0')).toBeTruthy();

    fireEvent.click(getByText(button));

    expect(queryByText('INCREMENT: 1')).toBeTruthy();
  });

  it('create a flux dispatcher', () => {
    const empty: EmptyDispatcher = { dispatch: null };

    const Container  = createContainer(TestComponent, reduce, empty);
    const dispatcher = empty as Dispatcher;

    const { queryByText } = render(
      <Container initialState={state} />
    );

    expect(queryByText('INCREMENT: 0')).toBeTruthy();

    act(() => {
      dispatcher.dispatch({ type: 'increment-count' });
    });

    expect(queryByText('INCREMENT: 1')).toBeTruthy();
  });
});
