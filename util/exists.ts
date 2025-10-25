import { assert } from 'std/assert/assert.ts'
import { Maybe } from '../types.ts'

export function exists<T>(obj: Maybe<T>): T {
  assert(obj != null, 'Expected object to not be null')
  return obj
}
