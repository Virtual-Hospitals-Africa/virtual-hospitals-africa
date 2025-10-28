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
