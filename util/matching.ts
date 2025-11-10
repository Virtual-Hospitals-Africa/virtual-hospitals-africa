import { assertArrayNonEmpty } from './arraySize.ts'

export default function matching<T>(
  pattern: Partial<T>,
) {
  assertArrayNonEmpty(Object.keys(pattern))
  return function (item: T): boolean {
    for (const key in pattern) {
      if (pattern[key] !== item[key]) {
        return false
      }
    }
    return true
  }
}
