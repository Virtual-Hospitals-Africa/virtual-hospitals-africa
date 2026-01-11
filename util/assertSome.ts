import { assert } from 'std/assert/assert.ts'
import { NonEmptyArray } from '../types.ts'

export default function assertSome<
  T,
>(
  array: T[],
  predicate: (item: T) => boolean,
): asserts array is NonEmptyArray<T> {
  const passes = array.some(predicate)
  assert(
    passes,
    `Expected predicate to be true for at least one value in ${JSON.stringify(array)}`,
  )
}
