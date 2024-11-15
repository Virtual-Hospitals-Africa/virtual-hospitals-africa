export default function uniq<T>(array: T[]): T[] {
  const uniqueArray: T[] = []
  const seenValues: Set<T> = new Set<T>()

  for (const value of array) {
    if (!seenValues.has(value)) {
      seenValues.add(value)
      uniqueArray.push(value)
    }
  }

  return uniqueArray
}

export function uniqBy<T, K extends keyof T>(
  array: T[],
  keyBy: K,
): T[] {
  const uniqueArray: T[] = []
  // deno-lint-ignore no-explicit-any
  const seenValues = new Set<any>()

  for (const value of array) {
    const key = value[keyBy]
    if (!seenValues.has(key)) {
      seenValues.add(key)
      uniqueArray.push(value)
    }
  }

  return uniqueArray
}
