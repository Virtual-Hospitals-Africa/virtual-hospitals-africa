import { NonEmptyArray } from '../types.ts'

export default function first<T>(array: NonEmptyArray<T>): T
export default function first<T>(array: T[]): T | undefined
export default function first<T>(array: T[]): T | undefined {
  return array[0]
}
