// deno-lint-ignore-file no-explicit-any

export function keyBy<
  T extends Record<string, unknown>,
  Key extends keyof T,
>(
  array: T[],
  key: Key,
): T[Key] extends string ? Record<T[Key], T> : never {
  const result: any = {}
  for (const item of array) {
    const key_value = item[key]
    if ((key_value as any) in result) {
      throw new Error('Duplicate key: ' + key_value)
    }
    result[key_value] = item
  }
  return result
}
