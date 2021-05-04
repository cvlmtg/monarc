# Using MONARC 🦋

Like any state management solution, we have different bits to create before we can use our application. This brief document assumes you already have used some state management frameworks or that you are at least familiar with the underlying concepts.

## Reducer

This is the equivalent of Flux's or Redux's reducer concept, i.e. a function that accepts a `state` and an `action` and returns the new state.

**NOTE:** MONARC assumes that your state is immutable, i.e. every changes produces a new state. However MONARC is not tied to any implementation, so you can choose the framework you prefer, like [immutable.js](https://immutable-js.github.io/immutable-js/), [immer](https://immerjs.github.io/immer/docs/introduction), etc.

*counter-reducer.js*

```js
export default function reduce(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
```

## Container

This is the component that we will render at the root of our application tree and that will manage the application's state. It is the equivalent of Flux's `<Container />` or Redux's `<Provider />`.

*container.jsx*

```jsx
import counterReducer from './counter-reducer';
import { createContainer } from 'monarc';

function CounterContainer({ store }) {
  return (
    <div>
      <Header />
      <Counter value={store}/>
    </div>
  );
}

export default createContainer(CounterContainer, counterReducer);
```

After we've create our container, we just need to render it with the initial state of our app:

*index.jsx*

```jsx
import CounterContainer from './containers/counter-container.jsx';
import ReactDOM from 'react-dom';
import React from 'react';

const node = document.getElementById('application');
const app  = (
  <CounterContainer initialState={0} />
);

ReactDOM.render(app, node);
```

#### Reducers

The `createContainer` function accepts a component and one or more reducers we created earlier. If your application gets big, you can split your reducers in different files and then pass them as an array to `createContainer`. When an action is fired, all the reducers will be called in order.

*container.jsx*

```jsx
export default createContainer(CounterContainer, [ counterReducer, otherReducer ]);
```

If we want to enable **undo** / **redo** or **auto-save**, we just need to use the included plugins:

*container.jsx*

```jsx
import { createContainer, withAutoSave, withUndoRedo } from 'monarc';
import counterReducer from './counter-reducer';

function CounterContainer() {
  ...
}

const reducer = withAutoSave(withUndoRedo(counterReducer), options);

export default createContainer(CounterContainer, reducer);
```

We can use both of them or just one of them as we wish. Each of these functions accept some options as the second parameter.

## withUndoRedo

This plugin enables undo / redo management. We will be able to save our application's state changes (up to a maximum value) and undo / redo to a previous state. There are also some behaviours which can be controlled by adding some [flags](#undo--redo-flags) to our actions.

### Undo / redo options

This function accepts the following options:

- **maxUndo**: (optional)

  The maximum number of states that will be saved on the undo / redo stack. If you specify 0, there will be no limit to the undo steps available (except for the user's browser memory). The default is 50.

- **getState** (optional)

  This function tells the store which part of the state to monitor for changes. Suppose we are writing a vector drawing application, we want to undo / redo changes made to the drawing. Which panel is open, the currently selected color etc. are all part of the application state, but we don't want to undo those. This function is passed a state and returns the part of the state that will be checked for changes and saved on the undo stack. If you don't specify any function, the default behaviour is to use the whole state.

  **NOTE:**
    - if your state or partial state is not immutable, or your partial state is made assembling different parts of the state, you should memoize the return value of this function.
    - if you specify this option, you must also provide the `setState` function.

```typescript
function getState(state: any) => any
```

- **setState** (optional)

  This function takes a state or partial state (whatever was returned from *getState*), the current state, and returns an updated state. If you don't specify any function, the store will replace the current state with the state taken from the stack.

  **NOTE:** if you specify this option, you must also provide the `getState` function.

```typescript
function setState(savedState: any, currentState: any) => any
```

- **undoAction** (optional)

  This is the `type` of the undo action. The default is `'UNDO'`.

- **redoAction** (optional)

  This is the `type` of the redo action. The default is `'REDO'`.

## Undo / redo flags

We can have a more fine-grained control over the undo / redo behaviour by adding some flags to any of our actions.

- **undoSkip**

  If any action has this attribute set to true, the state change will not be saved on the undo stack. If we are writing a vector drawing application we might have a list of the shapes drawn, each with a "selected" attribute. If the user resizes a shape and then selects another one, we might decide that pressing the undo button should undo the resize, not the selection.

  ```js
  { type: 'SELECT_SHAPE', id: 123, undoSkip: true }
  ```

- **undoReset**

  If any action has this attribute set to true, the undo / redo stack will be reset. Using the same vector drawing application example, we might use this when the user loads a new document or creates a new one.

  ```js
  { type: 'NEW_DOCUMENT', undoReset: true }
  ```

- **undoStream**

  Let's suppose we need to fire an action when the user resizes a shape in our vector drawing application. As the user drags the mouse, we will fire more than one `RESIZE_SHAPE` action to update the shape coordinates. However we don't want to undo all these intermediate changes, just the last one. If we set the `undoStream` flag to true, the store will create a new undo state only for the last `RESIZE_SHAPE` action.

  ```js
  { type: 'RESIZE_SHAPE', x, y, width, height, undoStream: true }
  ```

  **NOTE:** To actually create the undo state, we must fire an action with `undoStream` set to false or with a different `type`. This is how the store understands which was the "last action".

## withAutoSave

This plugin enables the auto-save feature. Whenever the state changes, a timer will be started. When the timer expires, the current state of the application will be saved. We can also choose to save the state *before* the change.

The save will be immediately triggered on unmount and on the [beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) event too.

**NOTE:** The function `withAutoSave` should always be called last.

### Auto-save options

This function accepts the following options:

- **onSave** _(required)_

  This is the function that gets called when the state needs to be saved.

  ```typescript
  function onSave(state: any, callback?: () => void) => void
  ```

  The first parameter is the current state. The (optional) second parameter is a callback that we will call to signal that the save has been completed. This might be useful if we want to wait for the server response before telling the user that the data has been saved.

- **delay** (optional)

  The number of milliseconds after which the `onSave` function is called. You can set it to 0, which basically means to save immediately after the render of the new state. The default is 5 seconds.

- **onUpdate** (optional)

  This function gets called on every state change to see if the state needs to be saved. If we don't specify it, the auto-save will be triggered on every state change. The function is called with the previous state, the updated state and the action that updated the state.

  ```typescript
  onUpdate: (previous: any, updated: any, action: Action) => boolean;
  ```

- **onBeforeUpdate** (optional)

  This is basically the same of `onUpdate`, but if it returns true, the *previous* state is saved immediately. This function gets an extra parameter telling if the auto-save timer is active.

  Suppose we are writing a file navigation app for our Google Drive or Dropbox account. We have the usual icons and list visualization modes. When we change folder, we want to save the visualization mode for the folder we just left, not for the new one.

  ```typescript
  onBeforeUpdate: (previous: any, updated: any, action: Action, isTimerActive: boolean) => boolean;
  ```

## withDevTools

This plugin connects your application to the [Redux DevTools](https://github.com/reduxjs/redux-devtools) extension. Follow the instructions described on [Github](https://github.com/reduxjs/redux-devtools/blob/master/extension/README.md) to install the extension for your browser.

If you use [immutable.js](https://immutable-js.github.io/immutable-js/) for your application state, remember to pass the correct options to the Redux DevTools, for example:

```js
import { State } from './my-app-state-record';
import reducer from './my-app-reducer';
import Immutable from 'immutable';

let reducers = [ reducer ];

if (process.env.NODE_ENV !== 'production') {
  const options = {
    serialize: {
      immutable: Immutable,
      refs:      [ State ]
    }
  };

  reducers = withDevTools(reducers, options);
}
```

Options are described [here](https://github.com/reduxjs/redux-devtools/blob/master/extension/docs/API/Arguments.md).

## Hooks

MONARC provides some hooks to access its state on every functional component of your application:

- **useStore**

  Returns the store's state.

- **useDispatch**

  Returns the dispatcher function needed to dispatch actions to the store.

- **useUndoRedo**

  Returns `{ canUndo, canRedo }` which tells if the undo and redo stacks are empty or not.

- **useAutoSave**

  Returns `{ isSaved }` which tells if the store's state is saved or not.

For class based components you can use the [contextType](https://en.reactjs.org/docs/context.html#classcontexttype) attribute, or render the corresponding context [\<Consumer />](https://en.reactjs.org/docs/context.html#contextconsumer).

- **storeContext** `{ dispatch, state }`
- **undoContex** `{ canUndo, canRedo }`
- **saveContext** `{ isSaved }`

---

[Back to the index](../README.md)
