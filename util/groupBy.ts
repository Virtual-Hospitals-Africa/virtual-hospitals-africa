export default function groupBy<T extends Record<string, unknown>, K>(
  array: T[],
  iteratee: (value: T) => K,
): Map<K, T[]> {
  const result = new Map<K, T[]>()
  for (const item of array) {
    const key = iteratee(item)
    if (result.has(key)) {
      result.get(key)!.push(item)
    } else {
      result.set(key, [item])
    }
  }
  return result
}
