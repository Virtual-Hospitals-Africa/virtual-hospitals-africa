import { Falsy } from '../types.ts'

export default function compact<T>(arr: (T | Falsy)[]): T[] {
  const toReturn: T[] = []
  for (const item of arr) {
    if (item) {
      toReturn.push(item)
    }
  }
  return toReturn
}
