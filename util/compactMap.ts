import { Falsy } from '../types.ts'

export default function compactMap<T, U>(
  arr: Iterable<T>,
  callback: (item: T) => Falsy | U,
): U[] {
  const to_return: U[] = []
  for (const item of arr) {
    const value = callback(item)
    if (value) {
      to_return.push(value)
    }
  }
  return to_return
}
