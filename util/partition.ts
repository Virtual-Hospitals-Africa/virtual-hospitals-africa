export default function partition<T, P extends T>(
  array: T[],
  predicate: (item: T) => item is P,
): [P[], Exclude<T, P>[]]
export default function partition<T>(
  array: T[],
  predicate: (item: T) => boolean,
): [T[], T[]]
export default function partition<T>(
  array: T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const passes: T[] = []
  const fails: T[] = []
  for (const item of array) {
    if (predicate(item)) {
      passes.push(item)
    } else {
      fails.push(item)
    }
  }
  return [passes, fails]
}
