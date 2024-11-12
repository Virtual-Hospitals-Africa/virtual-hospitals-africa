import { assert } from 'std/assert/assert.ts'
import getTag from './internal/getTag.ts'
import isObjectLike from './isObjectLike.ts'

export default function isNumber(value: unknown): value is number {
  return (
    typeof value === 'number' ||
    (isObjectLike(value) && getTag(value) === '[object Number]')
  )
}

export function assertHasPositiveNumber<T extends string>(
  // deno-lint-ignore no-explicit-any
  value: any,
  key: T,
): asserts value is Record<T, string> {
  assert(key in value, `Expected '${key}' to be a non-empty string`)
  assert(
    isNumber(value[key]) && value[key] > 0,
    `Expected '${key}' to be a positive number`,
  )
}
