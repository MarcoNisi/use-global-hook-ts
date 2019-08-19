# use-global-hook
State management for React using Hooks with Typescript.

### Requirements
This library need React and ReactDOM as peer dependencies with a version greater than 16.8 because Hooks have been introduced in that version.

### Installation
```
npm i use-global-hook-ts
```

### Docs
The method ```useGlobalHook``` accept five paramters:
1. ```React```: Your instance of React;
2. ```initialState```: the initial state of your app;
3. ```actions```: an object of any structure with the methods to change the state of app;
4. ```persist```: if ```true```, the state will be saved in localStorage and refilled from it on page reload;
5. ```debug```: if ```true``` each action that change the state of app will be logged in console.

Each ```action``` receive as first parameter the ```Store```. With this store you can use the method ```setState``` in order to change the app state and you can also read the latter using the property ```state``` of the store.

### Basic example
```tsx
import React from 'react'
import useGlobalHook, { IStore } from 'use-global-hook-ts'

interface IAppState {
  text: string
}

const initialState: IAppState = {
  text: 'Hello'
}

const actions = {
  changeText: (store: IStore, newText: string) => {
    store.setState({ text: newText })
  }
}

const useGlobal = useGlobalHook(React, initialState, actions, true, true)

const ExampleComponent = (_: any) => {
  const [globalState, globalActions] = useGlobal()
  React.useEffect(() => {
    setTimeout(() => {
      globalActions.changeText('New text')
    }, 1000)
  }, [globalActions])
  return <span>{globalState.text}</span>
}

const AnotherComponent = (_: any) => {
  const [globalState] = useGlobal()
  return <span>{globalState.text}</span>
}

const Wrapper = (_: any) => {
  return <>
    <ExampleComponent/>
    <AnotherComponent/>
  </>
}
```

### TODO
- Rerender components based only on the slice of the App state that is used;
- Add more tests;
- Improve typings;
- Allow ```changes``` as ```setState``` parameter that match the type of app state;
- Improve Docs.