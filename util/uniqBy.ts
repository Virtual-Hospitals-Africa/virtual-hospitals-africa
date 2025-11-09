export function uniqBy<T, K extends keyof T>(
  array: T[],
  keyBy: K,
): T[] {
  const uniqueArray: T[] = []
  // deno-lint-ignore no-explicit-any
  const seen_values = new Set<any>()

  for (const value of array) {
    const key = value[keyBy]
    if (!seen_values.has(key)) {
      seen_values.add(key)
      uniqueArray.push(value)
    }
  }

  return uniqueArray
}
