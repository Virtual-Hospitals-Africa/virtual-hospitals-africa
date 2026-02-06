import { assert } from 'std/assert/assert.ts'
import { DeepPartial } from '../types.ts'
import isObjectLike from './isObjectLike.ts'

export function deepMerge<T>(target: T, ...sources: DeepPartial<T>[]): T {
  if (!isObjectLike(target)) return target
  const result: Record<string, unknown> = { ...target }
  for (const source of sources) {
    assert(isObjectLike(source))
    for (const key in source) {
      result[key] = isObjectLike(source[key]) ? deepMerge(result[key] ?? {}, source[key]) : source[key]
    }
  }
  return result as T
}
