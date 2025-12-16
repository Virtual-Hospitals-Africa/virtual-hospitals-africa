import { assert } from 'std/assert/assert.ts'

export default function assertLength<
  T,
>(
  array: T[],
  length: number,
) {
  assert(
    array.length === length,
    `Expected array to be length ${length}. Actual length ${array.length}. Actual value\n${
      JSON.stringify(array, null, 2)
    }`,
  )
}
