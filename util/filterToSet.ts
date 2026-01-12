import { Falsy } from '../types.ts'

export default function filterToSet<T, U>(
  arr: Iterable<T>,
  callback: (item: T) => Falsy | U,
): Set<U> {
  const to_return = new Set<U>()
  for (const item of arr) {
    const value = callback(item)
    if (value) {
      to_return.add(value)
    }
  }
  return to_return
}
