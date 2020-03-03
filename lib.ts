import { IStore, DeepPartial, DeepBoolPartial, Listener, IStoreOptions, ISetStateConf } from './interfaces'
import { cloneDeep, deepUpdate, shouldUpdate, overlap, debounce } from './utils'

const localStorageKey = 'useGlobalHookTs__storedState'
const localStorageKeyExp = 'useGlobalHookTs__exp'
const maxUndoable = 5

const debouncedSetItem = debounce(<S>(toBeStored: DeepPartial<S>, exp: string | null) => {
  localStorage.setItem(localStorageKey, JSON.stringify(toBeStored))
  if (exp) localStorage.setItem(localStorageKeyExp, JSON.stringify(exp))
}, 500)

function setState<S>(
  this: IStore<S>,
  changes: DeepPartial<S>,
  params?: ISetStateConf
) {
  const isFromHistory = (params && params.isFromHistory) || false
  const disableDeepClone = (params && params.disableDeepClone) || true
  const defer = (params && params.defer) || false

  const oldState = disableDeepClone ? { ...this.state } : cloneDeep(this.state)
  this.state = Object.freeze(deepUpdate({ ...this.state }, changes))
  this.lastChanges = changes
  if (this.options.debug) {
    console.group('STATE CHANGE')
    console.log('%c OLD STATE', 'color: grey; font-weight: bold;', oldState)
    console.log('%c CHANGES', 'color: blue; font-weight: bold;', changes)
    console.log('%c NEW STATE', 'color: green; font-weight: bold;', disableDeepClone ? { ...this.state } : cloneDeep(this.state))
    console.groupEnd()
  }
  this.listeners.forEach((listener: Listener<S>) => {
    if (shouldUpdate<DeepBoolPartial<S>>(listener.listenedTree, changes)) {
      if (defer) {
        setTimeout(() => listener.setState(this.state), 0)
      } else {
        listener.setState(this.state)
      }
    }
  })
  if (this.options.persistTree) {
    const toBeStored = this.options.persistTree === true ? this.state : overlap(this.state, this.options.persistTree)
    const exp = this.options.persistExp ? Date.now() + this.options.persistExp * 1000 : null
    debouncedSetItem(toBeStored, exp)
  }
  if (this.options.undoable && !isFromHistory) {
    this.past = [...this.past, oldState]
    cutHistory(this)
    this.future = []
  }
}

function useListener<S>(store: IStore<S>, React: any, listenedTree?: DeepBoolPartial<S>): [S, DeepPartial<S>] {
  const newSetState = React.useState()[1]
  React.useEffect(() => {
    store.listeners.push({ setState: newSetState, listenedTree })
    return () => {
      store.listeners = store.listeners.filter((listener: Listener<S>) => listener.setState !== newSetState)
    }
  }, [newSetState])
  const lastChanges = store.lastChanges ? overlap(store.lastChanges, listenedTree) : null
  return [store.state, lastChanges]
}

const makeUndo = <S>(store: IStore<S>) => {
  return () => {
    const previous = store.past[store.past.length - 1]
    if (previous) {
      const newPast = store.past.slice(0, store.past.length - 1)
      store.future = [cloneDeep(store.state), ...store.future]
      store.past = newPast
      cutHistory(store)
      store.setState(previous, { isFromHistory: true })
    }
  }
}

const cutHistory = <S>(store: IStore<S>) => {
  if (store.options.maxUndoable) {
    if (store.past.length > store.options.maxUndoable) {
      store.past.shift()
    }
    if (store.future.length > store.options.maxUndoable) {
      store.past.pop()
    }
  }
}

const makeRedo = <S>(store: IStore<S>) => {
  return () => {
    const next = store.future[0]
    if (next) {
      const newFuture = store.future.slice(1)
      store.past = [...store.past, cloneDeep(store.state)]
      store.future = newFuture
      cutHistory(store)
      store.setState(next, { isFromHistory: true })
    }
  }
}

const initializer = <S>(store: IStore<S>) => {
  try {
    const storedState = localStorage.getItem(localStorageKey)
    const exp = localStorage.getItem(localStorageKeyExp)
    const expired = exp && exp < '' + Date.now()
    if (storedState && !expired) {
      const parsedStoredState = JSON.parse(storedState)
      let filteredState = {}
      if (store.options.persistTree) {
        filteredState = store.options.persistTree === true ? parsedStoredState : overlap(parsedStoredState, store.options.persistTree)
        store.setState({
          ...store.state,
          ...filteredState
        })
      }
    }
  } catch (_) {}
}

const createStore = <S>(
  React: any,
  initialState: S,
  options?: IStoreOptions<S>
): {
  useGlobal: (listenedTree?: DeepBoolPartial<S>) => [S, DeepPartial<S>]
  store: IStore<S>
  historyActions: {
    undo: () => void
    redo: () => void
  }
} => {
  const defaultOptions: IStoreOptions<S> = {
    debug: true,
    persistTree: false,
    undoable: false,
    maxUndoable,
    persistExp: 0
  }
  const store: IStore<S> = {
    state: initialState,
    future: [],
    past: [],
    listeners: [],
    setState,
    lastChanges: null,
    options: options ? { ...defaultOptions, ...options } : defaultOptions
  }
  store.setState = setState.bind(store)
  initializer<S>(store)
  return {
    useGlobal: (listenedTree?: DeepBoolPartial<S>) => useListener(store, React, listenedTree),
    store,
    historyActions: {
      undo: makeUndo(store),
      redo: makeRedo(store)
    }
  }
}

export default createStore
