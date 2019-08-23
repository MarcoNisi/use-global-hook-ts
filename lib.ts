import { IStore, DeepPartial, DeepBoolPartial, Listener } from './interfaces'
import { cloneDeep, deepUpdate, shouldUpdate, overlap } from './utils'

const localStorageKey = 'useGlobalHookTs__storedState'

function setState<S>(this: IStore<S>, changes: DeepPartial<S>) {
  const oldState = cloneDeep(this.state)
  this.state = deepUpdate({ ...this.state }, changes)
  if (this.debug) {
    console.group('STATE CHANGE')
    console.log('%c OLD STATE', 'color: grey; font-weight: bold;', oldState)
    console.log('%c CHANGES', 'color: blue; font-weight: bold;', changes)
    console.log('%c NEW STATE', 'color: green; font-weight: bold;', this.state)
    console.groupEnd()
  }
  this.listeners.forEach((listener: Listener<S>) => {
    if (shouldUpdate(listener.listenedTree, changes)) {
      listener.setState(this.state)
    }
  })
  localStorage.setItem(localStorageKey, JSON.stringify(this.state))
}

function useCustom<S>(this: IStore<S>, React: any, listenedTree: DeepBoolPartial<S>): [any, any] {
  const newSetState = React.useState()[1]
  React.useEffect(() => {
    this.listeners.push({ action: newSetState, listenedTree })
    return () => {
      this.listeners = this.listeners.filter(
        (listener: Listener<S>) => listener.setState !== newSetState
      )
    }
  }, [newSetState])
  return [this.state, this.actions]
}

const associateActions = <S>(store: IStore<S>, actions: any) => {
  const associatedActions: any = {}
  Object.keys(actions).forEach(key => {
    if (typeof actions[key] === 'function') {
      associatedActions[key] = actions[key].bind(null, store)
    }
    if (typeof actions[key] === 'object') {
      associatedActions[key] = associateActions(store, actions[key])
    }
  })
  return associatedActions
}

const initializer = <S>(store: IStore<S>, persistTree: DeepBoolPartial<S>): DeepPartial<S> => {
  try {
    const storedState = localStorage.getItem(localStorageKey)
    if (storedState) {
      const parsedStoredState = JSON.parse(storedState)
      const filteredState = overlap(parsedStoredState, persistTree)
      return {
        ...store.state,
        ...filteredState
      }
    } else return store.state
  } catch (_) {
    return store.state
  }
}

const useGlobalHook = <S>(
  React: any,
  initialState: S,
  actions: any,
  persistTree: null | DeepBoolPartial<S> = null,
  debug = false
): ((listenedTree?: DeepBoolPartial<S>) => [S, any]) => {
  const store: IStore<S> = {
    state: initialState,
    listeners: [],
    debug,
    setState,
    actions
  }
  store.setState = setState.bind(store)
  store.actions = associateActions(store, actions)
  if (persistTree) store.setState(initializer<S>(store, persistTree))
  const bindedUseCustom = (listenedTree?: DeepBoolPartial<S>) => useCustom.bind(store, React, listenedTree)
  return bindedUseCustom()
}

export default useGlobalHook
