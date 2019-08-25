import { IStore, DeepPartial, DeepBoolPartial, Listener, IStoreOptions } from './interfaces'
import { cloneDeep, deepUpdate, shouldUpdate, overlap, debounce } from './utils'

const localStorageKey = 'useGlobalHookTs__storedState'

const debouncedSetItem = debounce(<S>(toBeStored: DeepPartial<S>) => {
  localStorage.setItem(localStorageKey, JSON.stringify(toBeStored))
}, 500)

function setState<S>(this: IStore<S>, changes: DeepPartial<S>) {
  const oldState = cloneDeep(this.state)
  this.state = Object.freeze(deepUpdate({ ...this.state }, changes))
  this.lastChanges = changes
  if (this.options.debug) {
    console.group('STATE CHANGE')
    console.log('%c OLD STATE', 'color: grey; font-weight: bold;', oldState)
    console.log('%c CHANGES', 'color: blue; font-weight: bold;', changes)
    console.log('%c NEW STATE', 'color: green; font-weight: bold;', this.state)
    console.groupEnd()
  }
  this.listeners.forEach((listener: Listener<S>) => {
    if (shouldUpdate<DeepBoolPartial<S>>(listener.listenedTree, changes)) {
      listener.setState(this.state)
    }
  })
  if (this.options.persistTree) {
    const toBeStored = this.options.persistTree === true ? this.state : overlap(this.state, this.options.persistTree)
    debouncedSetItem(toBeStored)
  }
}

function useListener<S>(this: IStore<S>, React: any, listenedTree: DeepBoolPartial<S>): [any, any, any] {
  const newSetState = React.useState()[1]
  React.useEffect(() => {
    this.listeners.push({ setState: newSetState, listenedTree })
    return () => {
      this.listeners = this.listeners.filter(
        (listener: Listener<S>) => listener.setState !== newSetState
      )
    }
  }, [newSetState])
  const lastChanges = this.lastChanges ? overlap(this.lastChanges, listenedTree) : null
  return [this.state, this.actions, lastChanges]
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

const initializer = <S>(store: IStore<S>): DeepPartial<S> => {
  try {
    const storedState = localStorage.getItem(localStorageKey)
    if (storedState) {
      const parsedStoredState = JSON.parse(storedState)
      let filteredState = {}
      if (store.options.persistTree) {
        filteredState = store.options.persistTree === true ? parsedStoredState : overlap(parsedStoredState, store.options.persistTree)
      }
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
  options?: IStoreOptions<S>
): ((listenedTree?: DeepBoolPartial<S>) => [S, any, DeepPartial<S>]) => {
  const defaultOptions: IStoreOptions<S> = {
    debug: true,
    persistTree: false
  }
  const store: IStore<S> = {
    state: initialState,
    listeners: [],
    setState,
    actions,
    lastChanges: null,
    options: options ? { ...defaultOptions, ...options } : defaultOptions
  }
  store.setState = setState.bind(store)
  store.actions = associateActions(store, actions)
  if (store.options.persistTree) store.setState(initializer<S>(store))
  return (listenedTree?: DeepBoolPartial<S>) => useListener.bind(store, React, listenedTree)()
}

export default useGlobalHook
