export function collect<T>(generator: Generator<T, void, unknown>): T[] {
  const array: T[] = []
  for (const item of generator) {
    array.push(item)
  }
  return array
}

export function collectSorted<T>(
  generator: Generator<T, void, unknown>,
  compareFn: (a: T, b: T) => number,
): T[] {
  const sorted_array: T[] = []

  for (const item of generator) {
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
  const sorted_array: T[] = []

  for (const item of generator) {
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
  generator: Generator<number, void, unknown>,
): number[] {
  return collectSortedUniq(generator, (a, b) => a - b)
}

export function collectSortedUniqStrings(
  generator: Generator<string, void, unknown>,
): string[] {
  return collectSortedUniq(generator, (a, b) => a.localeCompare(b))
}
