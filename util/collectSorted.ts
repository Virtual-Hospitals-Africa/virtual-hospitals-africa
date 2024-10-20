export function collectSorted<T>(
  generator: Generator<T, void, unknown>,
  compareFn: (a: T, b: T) => number,
): T[] {
  const sortedArray: T[] = []

  for (const item of generator) {
    // Find the correct index to insert the item using binary search
    let left = 0
    let right = sortedArray.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (compareFn(item, sortedArray[mid]) < 0) {
        right = mid
      } else {
        left = mid + 1
      }
    }

    // Insert the item at the found index
    sortedArray.splice(left, 0, item)
  }

  return sortedArray
}

export function collectSortedNumbers(
  generator: Generator<number, void, unknown>,
): number[] {
  return collectSorted(generator, (a, b) => a - b)
}

export function collectSortedStrings(
  generator: Generator<string, void, unknown>,
): string[] {
  return collectSorted(generator, (a, b) => a.localeCompare(b))
}

export function collectSortedUniq<T>(
  generator: Generator<T, void, unknown>,
  compareFn: (a: T, b: T) => number,
): T[] {
  const sortedArray: T[] = []

  for (const item of generator) {
    // Find the correct index to insert the item using binary search
    let left = 0
    let right = sortedArray.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      const comparison = compareFn(item, sortedArray[mid])

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
      sortedArray.splice(left, 0, item)
    }
  }

  return sortedArray
}

export function collectSortedUniqNumbers(
  generator: Generator<number, void, unknown>,
): number[] {
  return collectSortedUniq(generator, (a, b) => a - b)
}

export function collectSortedUniqStrings(
  generator: Generator<string, void, unknown>,
): string[] {
  return collectSortedUniq(generator, (a, b) => a.localeCompare(b))
}
