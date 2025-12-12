import { assert } from 'std/assert/assert.ts'

export default function assertOneOf<T>(
  item: unknown,
  array: readonly T[],
  explanation?: string,
): asserts item is T {
  const use_explanation = explanation ? `\n${explanation}` : ''
  assert(
    array.includes(item as T),
    `Expected ${JSON.stringify(item)} to be one of ${
      JSON.stringify(array)
    }${use_explanation}`,
  )
}
