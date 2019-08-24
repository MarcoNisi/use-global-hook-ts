import { DeepPartial } from './interfaces'

export const deepUpdate = (oldObject: any, changes: any) => {
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

export const overlap = (primary: any, secondary: any): any => {
  if (!secondary) return primary
  return Object.assign({}, ...Object.keys(primary).map((k: string) => {
    if (!(k in secondary)) {
      return {}
    }
    if (
      primary[k] &&
      typeof primary[k] === 'object' &&
      secondary[k] &&
      typeof secondary[k] === 'object'
    ) {
      let tmp = overlap(primary[k], secondary[k])
      return Object.keys(tmp).length ? { [k]: tmp } : {}
    }
    if (secondary[k] === true) {
      return { [k]: primary[k] }
    }
    return {}
  }))
}

export const shouldUpdate = <S>(listenedTree: S, changes: DeepPartial<S>): boolean => {
  const commonKeys = overlap(changes, listenedTree)
  return Object.keys(commonKeys).length > 0
}

export const cloneDeep = (oldObject: any) => {
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

export const debounce = (func: any, wait = 100) => {
  let timeoutId: number
  return function (this: any, ...args: any[]) {
    const next = () => func.apply(this, args)
    clearTimeout(timeoutId)
    timeoutId = setTimeout(next, wait)
  }
}