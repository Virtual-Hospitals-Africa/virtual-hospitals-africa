import { assert } from 'std/assert/assert.ts'

export default function assertOneOf<T>(
  item: unknown,
  array: readonly T[],
): asserts item is T {
  assert(
    array.includes(item as T),
    `Expected ${JSON.stringify(item)} to be one of ${JSON.stringify(array)}`,
  )
}
