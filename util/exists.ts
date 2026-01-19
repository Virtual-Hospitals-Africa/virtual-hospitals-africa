import { assert } from 'std/assert/assert.ts'
import { Maybe } from '../types.ts'

export function exists<T>(obj: Maybe<T>, message?: string): T {
  assert(obj != null, message || 'Expected object to not be null')
  return obj
}
