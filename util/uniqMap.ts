export default function uniqMap<T, U>(
  arr: Iterable<T>,
  callback: (item: T) => U,
): U[] {
  const unique_array: U[] = []
  const seen_values: Set<U> = new Set<U>()

  for (const item of arr) {
    const value = callback(item)
    if (!seen_values.has(value)) {
      seen_values.add(value)
      unique_array.push(value)
    }
  }

  return unique_array
}
