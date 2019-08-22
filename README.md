# use-global-hook-ts
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

When call ```useGlobal``` inside a component you can pass an object with a sub set of app state's keys with boolean value. The component will be updated only when the sub set of app state will change (see Example).

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
  changeText: (store: IStore, newText: string) => {
    store.setState({ text: newText })
  }
}

const useGlobal = useGlobalHook(React, initialState, actions, false, true)

const ExampleComponent = (_: any) => {
  const [globalState, globalActions] = useGlobal()
  React.useEffect(() => {
    setTimeout(() => {
      globalActions.changeText('New text')
    }, 1000)
  }, [globalActions])
  console.log('ExampleComponent render')
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

### TODO
- Improve typings;
- Allow ```changes``` as ```setState``` parameter that match the type of app state;
- Improve Docs;
- Persist only slices of state defined by user (a.k.a. redux-persist);
- Reduce number of rerender.