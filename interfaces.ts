export interface IStore {
  state: any
  setState: (changes: any) => void
  listeners: any[]
  actions: any[]
  debug: boolean
}