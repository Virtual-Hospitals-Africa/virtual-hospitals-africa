export default function groupByUniq<T extends Record<string, unknown>, K>(
  array: T[],
  iteratee: (value: T) => K,
): Map<K, T> {
  const result = new Map<K, T>()
  for (const item of array) {
    const key = iteratee(item)
    if (result.has(key)) {
      throw new Error('Duplicate key: ' + key)
    }
    result.set(key, item)
  }
  return result
}
