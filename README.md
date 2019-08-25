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
4. ```options```: store configurations: 
    - ```persistTree```: a subset of app state's keys with boolean values that will be saved and auto refilled on page reload OR ```true``` if you want to save all the state OR ```false``` if you want to save nothing;
    - ```debug```: if ```true``` each action that change the state of app will be logged in console;
    - More options will come soon!

```ts
import useGlobalHook, { IStore } from 'use-global-hook-ts'

interface IAppState {
  movies: string[],
  loggedUser: any
}

const initialState: IAppState = {
  movies: [],
  loggedUser: null
}

const actions = {
  movies: {
    addMovie: (store: IStore<IAppState>, movie: string) => {
      const newMovies = [ ...store.state.movies, movie ]
      const newState = { ...store.state, movies: newMovies }
      store.setState(newState)
    }
  }
}

const useGlobal = useGlobalHook(React, initialState, actions, {
  debug: true,
  persistTree: {
    movies: false,
    loggedUser: true
  }
})
``` 

Each ```action``` receive as first parameter the ```Store```. With this store you can use the method ```setState``` in order to change the app state and you can also read the latter using the property ```state``` of the store.

When call ```useGlobal``` inside a component you can pass an object with a sub set of app state's keys with boolean value. The component will be updated only when the sub set of app state will change (see Example).

```useGlobal``` return three elements when is called inside a component:
1. ```globalState```: last version of the app state;
2. ```globalActions```: actions that can be called in order to change the app state;
3. ```lastChanges```: last changes made on the app state (```null``` if no changes are made yet). 

The app state is **immutable** (by Object.freeze) in order to guarantee that any component can't change it without using the actions.

### Persist
With the option ```persistTree``` you can achieve almost all of what you can do with [redux-persist blacklist and whitelist](https://www.npmjs.com/package/redux-persist#blacklist--whitelist). If you want to save only some keys of your app state, just set them with ```true``` inside the ```persistTree```. In a similar manner, if you want to exclude some other keys, set them to ```false```.
For example, if your app state is:
```ts
const appState = {
  someData: [1,2,3],
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

### React Native
You can use this library also for React Native development but, for the moment, you will have to set ```persistTree``` option to ```false```.

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

const useGlobal = useGlobalHook(React, initialState, actions, {
  debug: true
})

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
- Improve Docs;
- Add expiration for persist;

### Donation
If this project help you reduce time to develop, you can give me [a cup of coffee :)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JXTSP4WPLJRUG&source=url)