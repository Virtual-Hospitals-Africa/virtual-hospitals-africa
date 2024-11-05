import { assert } from 'std/assert/assert.ts'

export function assertEnum<T extends string>(
  test: string,
  items: T[],
): asserts test is T {
  assert(
    // deno-lint-ignore no-explicit-any
    items.includes(test as any),
    `Expected ${test} to be one of ${items.join(', ')}`,
  )
}

export function assertAllEnum<T extends string>(
  array: string[],
  items: T[],
): asserts array is Array<T> {
  for (const item of array) {
    assert(
      // deno-lint-ignore no-explicit-any
      items.includes(item as any),
      `Expected ${item} to be one of ${items.join(', ')}`,
    )
  }
}
