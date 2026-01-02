import { assert } from 'std/assert/assert.ts'

export function makeAssertion<T, U extends T>(
  predicate: (item: T) => item is U,
): (item: T) => asserts item is U {
  return function (item: T) {
    assert(predicate(item), `Expected ${item} to satisfy predicate`)
  }
}
