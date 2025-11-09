export default function uniq<T>(array: T[]): T[] {
  const uniqueArray: T[] = []
  const seen_values: Set<T> = new Set<T>()

  for (const value of array) {
    if (!seen_values.has(value)) {
      seen_values.add(value)
      uniqueArray.push(value)
    }
  }

  return uniqueArray
}
