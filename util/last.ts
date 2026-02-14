import type { NonEmptyArray, NumberIndexable } from '../types.ts'

export default function last<T>(indexable: NonEmptyArray<T>): T
export default function last<T>(indexable: NumberIndexable<T>): T | undefined
export default function last<T>(indexable: NumberIndexable<T>): T | undefined {
  if (indexable.length === 0) {
    return undefined
  }

  return indexable[indexable.length - 1]
}
