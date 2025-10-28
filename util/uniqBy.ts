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
