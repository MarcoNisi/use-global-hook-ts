import { deepUpdate, deepClone } from './utils'

describe('Utils functions', () => {
  describe('deepUpdate', () => {
    it('should update provided object with provided changes', () => {
      const initialObject = { a: { b: 'c' }, d: 'e' }
      const changes = { a: { b: 'f' } }
      const correctResult = { a: { b: 'f' }, d: 'e' }
      expect(deepUpdate(initialObject, changes)).toMatchObject(correctResult)
    })
  })
  describe('deepClone', () => {
    it('should deeply clone provided object', () => {
      const initialObject = { a: { b: 'c' }, d: { e: { f: 'g' }} }
      const clonedObject = deepClone(initialObject)
      expect(clonedObject.a).not.toBe(initialObject.a)
      expect(clonedObject.d).not.toBe(initialObject.d)
      expect(clonedObject.d.e).not.toBe(initialObject.d.e)
    })
  })
})