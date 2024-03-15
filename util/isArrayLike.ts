import isLength from './isLength.ts'

// deno-lint-ignore no-explicit-any
export default function isArrayLike(value: any) {
  return value != null && typeof value !== 'function' && isLength(value.length)
}
