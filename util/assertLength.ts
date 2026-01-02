import { assert } from 'std/assert/assert.ts'
import { humanReadableJson } from './humanReadableJson.ts'

export default function assertLength<
  T extends {
    length: number
  },
>(
  array: T,
  length: number,
) {
  assert(
    array.length === length,
    `Expected array to be length ${length}. Actual length ${array.length}. Actual value\n${
      humanReadableJson(array)
    }`,
  )
}
