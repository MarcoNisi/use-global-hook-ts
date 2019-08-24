# use-global-hook-ts
State management for React using Hooks with Typescript.

### Requirements
This library needs React and ReactDOM as peer dependencies with a version greater than 16.8 because Hooks have been introduced in that version.

### Installation
```
npm i use-global-hook-ts
```

### Docs
The method ```useGlobalHook``` accept five paramters:
1. ```React```: Your instance of React;
2. ```initialState```: the initial state of your app;
3. ```actions```: an object of any structure with the methods to change the state of app;
4. ```persistTree```: a subset of app state's keys with boolean value that will be saved and auto refilled on page reload OR ```true``` if you want to save all the state OR ```false``` if you want to save nothing;
5. ```debug```: if ```true``` each action that change the state of app will be logged in console.

Each ```action``` receive as first parameter the ```Store```. With this store you can use the method ```setState``` in order to change the app state and you can also read the latter using the property ```state``` of the store.

When call ```useGlobal``` inside a component you can pass an object with a sub set of app state's keys with boolean value. The component will be updated only when the sub set of app state will change (see Example).

```useGlobal``` return three elements when is called inside a component:
1. ```globalState```: last version of the app state;
2. ```globalActions```: actions that can be called in order to change the app state;
3. ```lastChanges```: last changes made on the app state (```null``` if no changes are made yet). 

The app state is **immutable** (by Object.freeze) in order to guarantee that any component can't change it without using the actions.

### Class component
You can use this package also with class components wrapping them into a HOC Component (see Example).

### Basic example
```tsx
import React from 'react'
import useGlobalHook, { IStore } from 'use-global-hook-ts'

interface IAppState {
  text: string,
  data: string
}

const initialState: IAppState = {
  text: 'Hello',
  data: 'Useless'
}

const actions = {
  changeText: (store: IStore<IAppState>, newText: string) => {
    store.setState({ text: newText })
  }
}

const useGlobal = useGlobalHook(React, initialState, actions, false, true)

const ExampleComponent = (_: any) => {
  const [globalState, globalActions, lastChanges] = useGlobal()
  React.useEffect(() => {
    setTimeout(() => {
      globalActions.changeText('New text')
    }, 1000)
  }, [globalActions])
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
- Improve Docs