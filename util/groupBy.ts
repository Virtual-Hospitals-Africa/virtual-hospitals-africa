export function groupBy<T extends Record<string, unknown>, K>(
  array: T[],
  iteratee: (value: T, i: number) => K,
): Map<K, T[]> {
  const result = new Map<K, T[]>()
  for (const [i, item] of array.entries()) {
    const key = iteratee(item, i)
    if (result.has(key)) {
      result.get(key)!.push(item)
    } else {
      result.set(key, [item])
    }
  }
  return result
}

export function groupByUniq<T extends Record<string, unknown>, K>(
  array: T[],
  keyBy: (value: T, i: number) => K,
): Map<K, T> {
  const result = new Map<K, T>()
  for (const [i, item] of array.entries()) {
    const key = keyBy(item, i)
    if (result.has(key)) {
      throw new Error('Duplicate key: ' + key)
    }
    result.set(key, item)
  }
  return result
}

export function groupByMapped<T extends Record<string, unknown>, K, U>(
  array: T[],
  keyBy: (value: T, i: number) => K,
  valueBy: (value: T, i: number) => U,
): Map<K, U> {
  const result = new Map<K, U>()
  for (const [i, item] of array.entries()) {
    const key = keyBy(item, i)
    if (result.has(key)) {
      throw new Error('Duplicate key: ' + key)
    }
    result.set(key, valueBy(item, i))
  }
  return result
}
