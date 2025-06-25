// deno-lint-ignore-file no-explicit-any
export function groupBy<
  T extends Record<string, unknown>,
  KeyBy extends (
    | keyof T
    | ((value: T, i: number) => string | number | symbol)
  ),
>(
  array: T[],
  keyBy: KeyBy,
): KeyBy extends keyof T ? Map<T[KeyBy], T[]>
  : KeyBy extends (value: T, i: number) => infer K ? Map<K, T[]>
  : never {
  const result = new Map()
  for (const [i, item] of array.entries()) {
    const key = typeof keyBy === 'function'
      ? keyBy(item, i)
      : item[keyBy as any]
    if (result.has(key)) {
      result.get(key)!.push(item)
    } else {
      result.set(key, [item])
    }
  }
  return result as any
}

export function groupByUniq<
  T extends Record<string, unknown>,
  KeyBy extends (
    | keyof T
    | ((value: T, i: number) => string | number | symbol)
  ),
>(
  array: T[],
  keyBy: KeyBy,
): KeyBy extends keyof T ? Map<T[KeyBy], T>
  : KeyBy extends (value: T, i: number) => infer K ? Map<K, T>
  : never {
  const result = new Map()
  for (const [i, item] of array.entries()) {
    const key = typeof keyBy === 'function'
      ? keyBy(item, i)
      : item[keyBy as any]
    if (result.has(key)) {
      throw new Error('Duplicate key: ' + key)
    }
    result.set(key, item)
  }
  return result as any
}

export function groupByMapped<
  T extends Record<string, unknown>,
  //keyof T = the set of the name of T elements
  //value, i are parameters
  //KeyBy = the key of the parameter
  //ValueBy = the value of the parameter
  KeyBy extends (
    | keyof T
    | ((value: T, i: number) => string | number | symbol)
  ),
  ValueBy extends (
    | keyof T
    | ((value: T, i: number) => unknown)
  ),
>(
  array: T[],
  keyBy: KeyBy,
  valueBy: ValueBy,
): KeyBy extends keyof T ? ValueBy extends keyof T ? Map<T[KeyBy], T[ValueBy]>
  : ValueBy extends (value: T, i: number) => infer V ? Map<T[KeyBy], V>
  : never
  : KeyBy extends (value: T, i: number) => infer K
    ? ValueBy extends keyof T ? Map<K, T[ValueBy]>
    : ValueBy extends (value: T, i: number) => infer V ? Map<K, V>
    : never
  : never {
  const result = new Map()
  for (const [i, item] of array.entries()) {
    const key = typeof keyBy === 'function'
      ? keyBy(item, i)
      : item[keyBy as any]

    if (result.has(key)) {
      throw new Error('Duplicate key: ' + key)
    }
    const value = typeof valueBy === 'function'
      ? valueBy(item, i)
      : item[valueBy as any]
    result.set(key, value)
  }
  return result as any
}
