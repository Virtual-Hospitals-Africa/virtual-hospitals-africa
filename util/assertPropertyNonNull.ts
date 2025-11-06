import { assert } from 'std/assert/assert.ts'

export function assertPropertyNonNull<
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  object: T,
  key: K,
): asserts object is T & { [k in K]: NonNullable<T[K]> } {
  assert(
    object[key] != null,
    `Expected ${key as string} to be a non-null value in ${
      JSON.stringify(object)
    }`,
  )
}
