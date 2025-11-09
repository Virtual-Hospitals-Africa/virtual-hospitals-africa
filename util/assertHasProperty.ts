import { assert } from 'std/assert/assert.ts'

export default function assertHasProperty<
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  object: T,
  key: K,
): asserts object is T & { [k in K]: NonNullable<T[k]> } {
  assert(
    key in object && object[key] != null,
    `Expected ${String(key)} to be a property of ${JSON.stringify(object)}`,
  )
}
