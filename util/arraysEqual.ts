import { assert } from 'std/assert/assert.ts'

export default function arraysEqual<T>(a: T[], b: T[]): boolean {
  assert(Array.isArray(a), 'a is not an array')
  assert(Array.isArray(b), 'b is not an array')
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}
