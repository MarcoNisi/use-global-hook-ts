export interface IStore {
  state: any
  setState: (changes: any) => void
  listeners: any[]
  actions: any[]
  debug: boolean
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]> extends object
    ? DeepPartial<T[P]>
    : boolean
}

function deepUpdate(oldObject: any, changes: any) {
  for (const prop in changes) {
    try {
      if (changes[prop].constructor === Object) {
        oldObject[prop] = deepUpdate(oldObject[prop], changes[prop])
      } else if (oldObject.hasOwnProperty(prop)) {
        oldObject[prop] = changes[prop]
      }
    } catch (e) {
      oldObject[prop] = changes[prop]
    }
  }
  return oldObject
}

function shouldUpdate(listenedTree: any, changes: any): boolean {
  if (!listenedTree) return true
  return Object.keys(listenedTree).some((k: string) => {
    if (!(k in changes)) {
      return false
    }
    if (
      listenedTree[k] &&
      typeof listenedTree[k] === 'object' &&
      changes[k] &&
      typeof changes[k] === 'object'
    ) {
      return shouldUpdate(listenedTree[k], changes[k])
    }
    if (listenedTree[k] === true) {
      return true
    }
    return false
  })
}

function cloneDeep(oldObject: any) {
  let newObject: any = Array.isArray(oldObject) ? [] : {}
  for (const prop in oldObject) {
    if (typeof oldObject[prop] === 'object') {
      newObject[prop] = cloneDeep(oldObject[prop])
    } else {
      newObject[prop] = oldObject[prop]
    }
  }
  return newObject
}

function setState(this: IStore, changes: any) {
  const oldState = cloneDeep(this.state)
  this.state = deepUpdate({ ...this.state }, changes)
  if (this.debug) {
    console.group('STATE CHANGE')
    console.log('%c OLD STATE', 'color: grey; font-weight: bold;', oldState)
    console.log('%c CHANGES', 'color: blue; font-weight: bold;', changes)
    console.log('%c NEW STATE', 'color: green; font-weight: bold;', this.state)
    console.groupEnd()
  }
  this.listeners.forEach((listener: any) => {
    if (shouldUpdate(listener.listenedTree, changes)) {
      listener.action(this.state)
    }
  })
  localStorage.setItem('storedState', JSON.stringify(this.state))
}

function useCustom(this: IStore, React: any, listenedTree: any): [any, any] {
  const newAction = React.useState()[1]
  React.useEffect(() => {
    this.listeners.push({ action: newAction, listenedTree })
    return () => {
      this.listeners = this.listeners.filter(
        (listener: any) => listener.action !== newAction
      )
    }
  }, [newAction])
  return [this.state, this.actions]
}

function associateActions(store: IStore, actions: any) {
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

const initializer = (store: IStore) => {
  try {
    const storedState = localStorage.getItem('storedState')
    if (storedState) {
      const parsedStoredState = JSON.parse(storedState)
      return {
        ...store.state,
        ...parsedStoredState
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
  persist = false,
  debug = false
): ((listenedTree?: DeepPartial<S>) => [S, any]) => {
  const store: IStore = {
    state: initialState,
    listeners: [],
    debug,
    setState,
    actions
  }
  store.setState = setState.bind(store)
  store.actions = associateActions(store, actions)
  if (persist) store.setState(initializer(store))
  return (listenedTree?: DeepPartial<S>) =>
    useCustom.bind(store, React, listenedTree)()
}

export default useGlobalHook
