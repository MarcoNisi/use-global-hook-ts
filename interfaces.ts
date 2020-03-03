export interface ISetStateConf {
  isFromHistory?: boolean
  disableDeepClone?: boolean
  defer?: boolean
}

export interface IStore<S> {
  state: S
  future: S[]
  past: S[]
  setState: (changes: DeepPartial<S>, conf?: ISetStateConf) => void
  listeners: any[]
  lastChanges: DeepPartial<S> | null
  options: IStoreOptions<S>
}

export interface IStoreOptions<S> {
  debug?: boolean
  persistTree?: DeepBoolPartial<S> | boolean
  undoable?: boolean
  maxUndoable?: number
  persistExp?: number
}

export type DeepBoolPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepBoolPartial<U>> | boolean
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepBoolPartial<U>> | boolean
    : DeepBoolPartial<T[P]> extends object
    ? DeepBoolPartial<T[P]> | boolean
    : boolean
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]> extends object
    ? DeepPartial<T[P]>
    : T[P]
}

export interface Listener<S> {
  listenedTree: DeepBoolPartial<S>
  setState: any
}