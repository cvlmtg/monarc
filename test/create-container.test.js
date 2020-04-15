import { createContainer, withUndoRedo } from '../src/index';

// ---------------------------------------------------------------------

const reduce = (state, action) => {
  switch (action.type) {
    case 'increment-count':
      return state.set('count', state.count + 1);

    default:
      return state;
  }
};

// ---------------------------------------------------------------------

describe('the createContainer constructor', () => {
  it('accepts a single reducer or an array of reducers', () => {
    const validArg   = () => createContainer('div', [ reduce ]);
    const stillValid = () => createContainer('div', reduce);

    expect(stillValid).not.toThrow();
    expect(validArg).not.toThrow();
  });

  it('accepts a "super reduce"', () => {
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
});
