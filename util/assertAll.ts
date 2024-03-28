import { Maybe } from '../types.ts'

export function assertAllHaveNonNullKey<
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

export function assertAllNotNull<
  T
>(
  array: Array<Maybe<T>>,
): asserts array is T[] {
  for (const item of array) {
    if (item == null) {
      throw new Error(`Expected all items be not null`)
    }
  }
}

export function assertAll<T, U extends T>(
  array: T[],
  assert: (item: T) => asserts item is U,
): asserts array is U[] {
  for (const item of array) {
    assert(item)
  }
}
