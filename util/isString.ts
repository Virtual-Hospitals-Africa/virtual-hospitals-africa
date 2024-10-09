import getTag from './internal/getTag.ts'
import { assertOr400 } from './assertOr.ts'

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
  assertOr400(key in value, `Expected '${key}' to be a non-empty string`)
  assertOr400(
    isString(value[key]),
    `Expected '${key}' to be a non-empty string`,
  )
}
