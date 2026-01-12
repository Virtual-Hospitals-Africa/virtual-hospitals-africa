export default function uniq<T>(array: T[]): T[] {
  const unique_array: T[] = []
  const seen_values: Set<T> = new Set<T>()

  for (const value of array) {
    if (!seen_values.has(value)) {
      seen_values.add(value)
      unique_array.push(value)
    }
  }

  return unique_array
}
