# use-global-hook-ts
State management for React using Hooks with Typescript.

### Requirements
This library needs React and ReactDOM as peer dependencies with a version greater than 16.8 because Hooks have been introduced in that version.

### Installation
```
npm i use-global-hook-ts
```

### Docs
The method ```useGlobalHook``` accept four paramters:
1. ```React```: Your instance of React;
2. ```initialState```: the initial state of your app;
3. ```options```: store configurations: 
    - ```persistTree```: a subset of app state's keys with boolean values that will be saved and auto refilled on page reload OR ```true``` if you want to save all the state OR ```false``` if you want to save nothing;
    - ```persistExp```: you can pass the number of seconds after which the stored state will be discarded;
    - ```debug```: if ```true``` each action that change the state of app will be logged in console;
    - ```undoable```: if ```true``` you will enable the undo/redo features;
    - ```maxUndoable```: you can pass here the max number of undo/redo history that you want to use;
    - More options will come soon!

```ts
import createStore, { IStore } from 'use-global-hook-ts'

interface IAppState {
  movies: string[],
  loggedUser: any
}

const initialState: IAppState = {
  movies: [],
  loggedUser: null
}

const { useGlobal, store } = createStore(React, initialState, {
  debug: true,
  persistTree: {
    movies: false,
    loggedUser: true
  },
  persistExp: 60,
  undoable: true,
  maxUndoable: 10
})

const actions = {
  movies: {
    addMovie: (movie: string) => {
      const newMovies = [ ...store.state.movies, movie ]
      const newState = { ...store.state, movies: newMovies }
      store.setState(newState)
    }
  }
}
``` 

Inside each ```action``` you have to use the method ```setState``` of ```store``` in order to change the app state and you can also read the latter using the property ```state``` of the store.

When call ```useGlobal``` inside a component you can pass an object with a sub set of app state's keys with boolean values. The component will be updated only when the sub set of app state will change (see Example).

```useGlobal``` returns two elements when is called inside a component:
1. ```globalState```: last version of the app state;
3. ```lastChanges```: last changes made on the app state (```null``` if no changes are made yet). 

### Immutability
With the option ```freezable``` the app state is **immutable** (by a deep freeze function) in order to guarantee that any component can't change it without using the actions.
If you try to directly mutate the state in ```strict``` mode, it will throw an error, otherwise it will fail silently.

### Persist
With the option ```persistTree``` you can achieve almost all of what you can do with [redux-persist blacklist and whitelist](https://www.npmjs.com/package/redux-persist#blacklist--whitelist). If you want to save only some keys of your app state, just set them with ```true``` inside the ```persistTree```. In a similar manner, if you want to exclude some other keys, set them to ```false```.
For example, if your app state is:
```ts
const appState = {
  someData: [1, 2, 3],
  tmpData: 'Tmp'
}
```
If you want to save only ```someData``` you can use a ```persistTree``` like:
```ts
const persistTree = {
  someData: true
}
```

### Class component
You can use this package also with class components wrapping them into a HOC Component (see Example).

### Undo/Redo
The ```createStore``` returns the property ```historyActions``` with the methods ```undo``` and ```redo``` that you can use respectively in order to revert or reapply the last action. You have to pass ```undoable: true``` in the options of the store in order to use this feature.

This feature will be improved in the next releases.

### React Native
You can use this library also for React Native development but, for the moment, you will have to set ```persistTree``` option to ```false```.

### Basic example
```tsx
import React from 'react'
import createStore, { IStore, store } from 'use-global-hook-ts'

interface IAppState {
  text: string,
  data: string
}

const initialState: IAppState = {
  text: 'Hello',
  data: 'Useless'
}

const { useGlobal, store } = createStore(React, initialState, {
  debug: true
})

const actions = {
  changeText: (newText: string) => {
    store.setState({ text: newText })
  }
}

const ExampleComponent = (_: any) => {
  const [globalState, lastChanges] = useGlobal()
  React.useEffect(() => {
    setTimeout(() => {
      actions.changeText('New text')
    }, 1000)
  }, [])
  console.log('ExampleComponent render. Last changes', lastChanges)
  return <span>{globalState.text}</span>
}

const AnotherComponent = (_: any) => {
  const [globalState] = useGlobal({
    data: true
  })
  console.log('AnotherComponent render')
  return <span>{globalState.text}</span>
}

class ClassComponent extends React.Component<{ text: string }> {
  render() {
    return <span>{this.props.text}</span>
  }
}

const HOCWithGlobalHook = (_: any) => {
  const [globalState] = useGlobal({
    text: true
  })
  console.log('HOCWithGlobalHook render')
  return <ClassComponent text={globalState.text} />
}
const Wrapper = (_: any) => {
  return <>
    <ExampleComponent/>
    <AnotherComponent/>
    <HOCWithGlobalHook/>
  </>
}
```

### For any question or request, feel free to open an issue on Github!

### TODO
- Improve Docs;
- Add more tests;
- Improve management of undo/redo;

### Donation
If this project help you reduce time to develop, you can give me [a cup of coffee :)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JXTSP4WPLJRUG&source=url)