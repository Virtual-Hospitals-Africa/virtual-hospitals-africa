import { NonEmptyArray } from '../types.ts'

export default function last<T>(array: NonEmptyArray<T>): T
export default function last<T>(array: T[]): T | undefined
export default function last<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined
  }

  return array[array.length - 1]
}
