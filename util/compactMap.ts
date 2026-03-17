import { Falsy } from '../types.ts'

export default function compactMap<T, U>(
  arr: Iterable<T>,
  callback: (item: T, index: number) => Falsy | U,
): U[] {
  const to_return: U[] = []
  let index = 0
  for (const item of arr) {
    const value = callback(item, index)
    if (value) {
      to_return.push(value)
    }
    index++
  }
  return to_return
}
