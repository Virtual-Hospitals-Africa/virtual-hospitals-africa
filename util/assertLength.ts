import { assert } from 'std/assert/assert.ts'

export default function assertLength<
  T,
>(
  array: T[],
  length: number,
) {
  assert(
    array.length === length,
    `Expected array to be length ${length}. Received ${JSON.stringify(array)}`,
  )
}
