import { type Decimal } from '../util/decimal.ts'

export function collect<T>(iterable: Iterable<T, void, unknown>): T[] {
  const array: T[] = []
  for (const item of iterable) {
    array.push(item)
  }
  return array
}

export function collectSorted<T>(
  iterable: Iterable<T, void, unknown>,
  compareFn: (a: T, b: T) => number,
): T[] {
  const sorted_array: T[] = []

  for (const item of iterable) {
    // Find the correct index to insert the item using binary search
    let left = 0
    let right = sorted_array.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (compareFn(item, sorted_array[mid]) < 0) {
        right = mid
      } else {
        left = mid + 1
      }
    }

    // Insert the item at the found index
    sorted_array.splice(left, 0, item)
  }

  return sorted_array
}

export function collectSortedNumbers(
  iterable: Iterable<number, void, unknown>,
): number[] {
  return collectSorted(iterable, (a, b) => a - b)
}

export function collectSortedStrings(
  iterable: Iterable<string, void, unknown>,
): string[] {
  return collectSorted(iterable, (a, b) => a.localeCompare(b))
}

export function collectSortedUniq<T>(
  iterable: Iterable<T, void, unknown>,
  compareFn: (a: T, b: T) => number,
): T[] {
  const sorted_array: T[] = []

  for (const item of iterable) {
    // Find the correct index to insert the item using binary search
    let left = 0
    let right = sorted_array.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      const comparison = compareFn(item, sorted_array[mid])

      if (comparison < 0) {
        right = mid
      } else if (comparison > 0) {
        left = mid + 1
      } else {
        // Item is already in the array, skip insertion
        left = -1
        break
      }
    }

    // If the item is unique, insert it at the found index
    if (left !== -1) {
      sorted_array.splice(left, 0, item)
    }
  }

  return sorted_array
}

export function collectSortedUniqNumbers(
  iterable: Iterable<number, void, unknown>,
): number[] {
  return collectSortedUniq(iterable, (a, b) => a - b)
}

export function collectSortedUniqDecimals(
  iterable: Iterable<Decimal, void, unknown>,
): Decimal[] {
  return collectSortedUniq(iterable, (a, b) => a.cmp(b))
}

export function collectSortedUniqStrings(
  iterable: Iterable<string, void, unknown>,
): string[] {
  return collectSortedUniq(iterable, (a, b) => a.localeCompare(b))
}
