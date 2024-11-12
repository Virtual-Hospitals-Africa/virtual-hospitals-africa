import { assert } from 'std/assert/assert.ts'
import getTag from './internal/getTag.ts'

export default function isString(value: unknown): value is string {
  const type = typeof value
  return (
    type === 'string' ||
    (type === 'object' &&
      value != null &&
      !Array.isArray(value) &&
      getTag(value) === '[object String]')
  )
}

export function assertHasNonEmptyString<T extends string>(
  // deno-lint-ignore no-explicit-any
  value: any,
  key: T,
): asserts value is Record<T, string> {
  assert(key in value, `Expected '${key}' to be a non-empty string`)
  assert(
    isString(value[key]),
    `Expected '${key}' to be a non-empty string`,
  )
}
