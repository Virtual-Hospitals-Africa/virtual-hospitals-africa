import { Falsy } from '../types.ts'

export default function compact<T>(arr: (T | Falsy)[]): T[] {
  const to_return: T[] = []
  for (const item of arr) {
    if (item) {
      to_return.push(item)
    }
  }
  return to_return
}
