import cloneDeep from 'clone-deep'

export interface IStore {
  state: any
  setState: (changes: any) => void
  listeners: any[]
  actions: any[]
  debug: boolean
}

function deepUpdate(oldState: any, changes: any) {
	for (var prop in oldState) {
	  try {
	    if (changes[prop].constructor === Object) {
	      oldState[prop] = deepUpdate(oldState[prop], changes[prop])
	    } else if (oldState.hasOwnProperty(prop)) {
	      oldState[prop] = changes[prop]
	    }
	  } catch(e) {
	    oldState[prop] = changes[prop]
	  }
	}
	return oldState
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
    listener(this.state)
  })
  localStorage.setItem('storedState', JSON.stringify(this.state))
}

function useCustom(this: IStore, React: any): [any, any] {
  const newListener = React.useState()[1]
  React.useEffect(() => {
    this.listeners.push(newListener)
    return () => {
      this.listeners = this.listeners.filter(
        (listener: any) => listener !== newListener
      )
    }
  }, [newListener])
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
): (() => [S, any]) => {
  const store: IStore = { state: initialState, listeners: [], debug, setState, actions }
  store.setState = setState.bind(store)
  store.actions = associateActions(store, actions)
  if (persist) store.setState(initializer(store))
  return useCustom.bind(store, React)
}

export default useGlobalHook
