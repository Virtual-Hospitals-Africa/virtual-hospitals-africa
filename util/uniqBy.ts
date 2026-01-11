export function uniqBy<T, K extends keyof T>(
  array: T[],
  keyBy: K | ((obj: T) => string | number),
): T[] {
  const unique_array: T[] = []
  const getter = typeof keyBy === 'function' ? keyBy : (obj: T) => obj[keyBy]

  // deno-lint-ignore no-explicit-any
  const seen_values = new Set<any>()

  for (const value of array) {
    const key = getter(value)
    if (!seen_values.has(key)) {
      seen_values.add(key)
      unique_array.push(value)
    }
  }

  return unique_array
}
