# Using MONARC

Like with any state management solution, we have different bits to create before we can use our application. However those bits should be already familiar if you have ever used Flux or Redux.

This brief document assumes you already have used one of that frameworks or that you are at least familiar with the underlying concepts.

## Reducer

This is the equivalent of Flux's or Redux's reducer concept, i.e. a function that accepts a `state` and an `action` and returns the new state.

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

This is the component that we will render at the root of our application tree and will manage the state. It is the equivalent of Flux's `Container` or Redux's `Provider`.

*container.jsx*
```js
import { createContainer, useDispatch, useStore } from 'monarc';
import counterReducer from './counter-reducer';

function AppContainer() {
  const dispatch = useDispatch();
  const store    = useStore();

  useEffect(() => {
    fetch('https://example.com/api/user.json')
      .then((response) => response.json())
      .then((data) => {
        dispatch({ type: 'USER_LOADED', ...data });
      });
  }, []);

  return (
    <div>
      <Header user={store.user} />
      <Application />
    </div>
  );
}

export default createContainer(AppContainer, counterReducer);
```

The `createContainer` function accepts a component and one or more reducers we created earlier. If your application gets big, you can split your reducers in different modules and then pass them as an array to `createContainer`. When an action is fired, all the reducers will be called in order.

*container.jsx*
```js
export default createContainer(AppContainer, [ counterReducer, otherReducer ]);
```

If we want to enable **undo** / **redo** or **auto-save**, we just need to use a couple of extra functions:

*application.js*
```js
import { createContainer, withAutoSave, withUndoRedo } from 'monarc';
import counterReducer from './counter-reducer';

function AppContainer() {
  ...
}

const reducer = withAutoSave(withUndoRedo(counterReducer), options);

export default createContainer(AppContainer, reducer);
```

We can use both of them or just one of them as we wish. Each of these functions accept some options as the second parameter.

**NOTE:** The function `withAutoSave` should always be the most external one.

## withUndoRedo

Using this function enables undo / redo management. We will be able to save our application state changes (up to a maximum value) and undo / redo to a previous state. There are also some features which can be controlled by adding some [flags](#actions-flags) to our actions.

### Options

This function accepts the following options:

- **stateKey** (optional)

  We can decide to undo / redo the whole state of the application or just a part of it. In this case we can use this option to specify the name of the state key to save.

  **NOTE:** If you specify a key, your state object must provide `get` and `set` methods to read and write that key. This is basically what [immutable.js](https://immutable-js.github.io/immutable-js/) `Record` and `Map` classes do, but any other library with the same interface should work.

- **maxUndo**: (optional)

  The maximum number of states that will be saved on the undo / redo stack. The default is 50.

- **undoAction** (optional)

  This is the `type` of the undo action. The default is `UNDO`.

- **redoAction** (optional)

  This is the `type` of the redo action. The default is `REDO`.

## Actions flags

We can have a more fine grained control over the undo / redo behaviour by adding some flags to our actions.

- **undoSkip**

  If any action has this attribute set to true, the state change will not be saved on the undo stack. If we are writing a vector drawing application, we might want to save in the store the color chosen by the user, but we are not interested in making that change undoable.

  ```js
  { type: 'SET_COLOR', color: 'blue', undoSkip: true }
  ```

- **undoReset**

  If any action has this attribute set to true, the undo / redo stack will be reset (i.e. emptied). Using the same vector drawing application example, we might use this when the user loads a new document or creates a new one.

  ```js
  { type: 'NEW_DOCUMENT', undoReset: true }
  ```

- **undoStream**

  Let's suppose we need to fire an action when the user resizes a shape in our vector drawing application. As the user drags the mouse, we will fire more than one `RESIZE_SHAPE` action to update the shape coordinates. However we don't want to undo all these intermediate changes, just the last one. If we set the *undoStream* flag to true, the store will create a new undo state only for the last `RESIZE_SHAPE` action.

  ```js
  { type: 'RESIZE_SHAPE', x, y, width, height, undoStream: true }
  ```

  **NOTE:** To actually create the undo state, we must fire an action with a different `type`. This is how the store understands which was the "last action".

## withAutoSave

Using this function enables the auto save feature. Whenever the state changes, a timer will be triggered. When the timer expires the current state of the application will be saved. We can also choose to save the state *before* the change.

Please note that the save will be immediately triggered on the [beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) event too.

### Options

This function accepts the following options:

- **onSave** _(required)_

  This is the function that gets called when the state needs to be saved.

  ```js
  function onSave(state: any, callback?: () => void) => void
  ```

  The first parameter is the current state. The (optional) second parameter is a callback that we will call to signal that the save has been completed. This might be useful if we want to wait for the server response before telling the user that the data has been saved.

- **delay** (optional)

  The number of milliseconds after which the *onSave* function is called. The default is 5000 ms.

- **onUpdate** (optional)

  This function gets called on every state change to see if the state needs to be saved. If we don't specify it, the auto save will be triggered on every state change. The function is called with the previous state, the updated state and the action that updated the state.

  ```js
  onUpdate: (state: any, updated: any, action: object) => boolean;
  ```

- **onBeforeUpdate** (optional)

  This is basically the same of *onUpdate*, but if it returns true, the *previous* state is saved immediately.

  Suppose we are writing a file navigation app for our Google Drive or Dropbox account. We have the usual icons and list visualization modes. When we change folder, we want to save the visualization mode for the folder we just left, not for the new one.

  ```js
  onBeforeUpdate: (state: any, updated: any, action: object) => boolean;
  ```

## Hooks

MONARC provides some hooks to access its state:

- **useStore**

  returns the store state.

- **useDispatch**

  returns the dispatcher used to dispatch actions to the store.

- **useUndoRedo**

  returns `{ canUndo, canRedo }` which tells if the undo and redo stacks are empty or not.

- **useAutoSave**

  returns `{ isSaved }` which tells if the store state is saved or not.

For class based components you can use the [contextType](https://en.reactjs.org/docs/context.html#classcontexttype) attribute and then access it with `this.context`, or render the corresponding [consumer](https://en.reactjs.org/docs/context.html#contextconsumer).

- **storeContext** `{ dispatch, state }`
- **undoContex** `{ canUndo, canRedo }`
- **saveContext** `{ isSaved }`
