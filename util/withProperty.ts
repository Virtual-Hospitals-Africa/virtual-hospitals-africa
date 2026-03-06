import { assert } from 'std/assert/assert.ts'
import { NonNullableProperty } from '../types.ts'

export default function withProperty<
  T extends Record<string, unknown>,
  K extends keyof T,
>(
  object: T,
  ...keys: K[]
): NonNullableProperty<T, K> {
  for (const key of keys) {
    assert(
      key in object && object[key] != null,
      `Expected ${String(key)} to be a property of ${JSON.stringify(object)}`,
    )
  }
  return object as unknown as NonNullableProperty<T, K>
}
