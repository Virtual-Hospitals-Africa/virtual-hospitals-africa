import getTag from './internal/getTag.ts'
import isArguments from './isArguments.ts'
import isArrayLike from './isArrayLike.ts'
import isPrototype from './internal/isPrototype.ts'

/** Used to check objects for own properties. */
const hasOwnProperty = Object.prototype.hasOwnProperty

// deno-lint-ignore no-explicit-any
export default function isEmpty(value: any): boolean {
  if (value == null) {
    return true
  }
  if (
    isArrayLike(value) &&
    (Array.isArray(value) ||
      typeof value === 'string' ||
      typeof value.splice === 'function' ||
      isArguments(value))
  ) {
    return !value.length
  }
  const tag = getTag(value)
  if (tag === '[object Map]' || tag === '[object Set]') {
    return !value.size
  }
  if (isPrototype(value)) {
    return !Object.keys(value).length
  }
  for (const key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false
    }
  }
  return true
}
