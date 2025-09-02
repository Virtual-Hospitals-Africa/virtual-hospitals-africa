export function assertAllNotNull<
  K extends string,
  T extends {
    [key in K]: unknown
  },
>(
  array: T[],
  key: K,
): asserts array is (T & { [key in K]: NonNullable<T[key]> })[] {
  for (const item of array) {
    if (item[key] == null) {
      throw new Error(`Expected all items to have property ${key}`)
    }
  }
}

export function assertAll<T, U>(
  array: T[],
  // deno-lint-ignore no-explicit-any
  assert: (item: any) => asserts item is U,
): asserts array is Array<T & U> {
  for (const item of array) {
    assert(item)
  }
}
