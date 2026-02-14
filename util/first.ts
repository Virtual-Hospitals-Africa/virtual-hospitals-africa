import type { NonEmptyArray, NumberIndexable } from '../types.ts'

export default function first<T>(indexable: NonEmptyArray<T>): T
export default function first<T>(indexable: NumberIndexable<T>): T | undefined
export default function first<T>(indexable: NumberIndexable<T>): T | undefined {
  return indexable[0]
}
