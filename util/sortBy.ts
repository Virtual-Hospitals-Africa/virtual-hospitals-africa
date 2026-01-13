import { assertArrayNonEmpty } from './arraySize.ts'
import { collectSorted } from './collectSorted.ts'

export default function sortBy<T>(
  iterable: Iterable<T>,
  ...iteratees: (keyof T | ((obj: T) => string | number | Date))[]
): T[] {
  assertArrayNonEmpty(iteratees, 'Must provide at least one sorting function')
  // 1. Normalize iteratees into getter functions
  const getters = iteratees.map((iteratee) => typeof iteratee === 'function' ? iteratee : (obj: T) => obj[iteratee])
  // 2. Form a combined comparison function
  function compare(a: T, b: T): number {
    for (const getter of getters) {
      const a_value = getter(a)
      const b_value = getter(b)

      if (a_value < b_value) return -1
      if (a_value > b_value) return 1
      // If equal, continue to the next getter for tie-breaking
    }
    return 0
  }

  // 3. Leverage collectSorted to build the array via binary insertion
  return collectSorted(iterable, compare)
}
