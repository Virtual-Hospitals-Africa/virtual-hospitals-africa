import { Falsy } from '../types.ts'

export default function compactMap<T, U>(
  arr: Iterable<T>,
  callback: (item: T) => Falsy | U
): U[] {
  const toReturn: U[] = []
  for (const item of arr) {
    const value = callback(item)
    if (value) {
      toReturn.push(value)
    }
  }
  return toReturn
}
