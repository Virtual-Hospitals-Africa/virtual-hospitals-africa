export default function partition<T, U>(
  array: (T | U)[],
  predicate: (item: T | U) => boolean,
): [T[], U[]] {
  const passes = [] as T[]
  const fails = [] as U[]
  for (const item of array) {
    if (predicate(item)) {
      passes.push(item as T)
    } else {
      fails.push(item as U)
    }
  }
  return [passes, fails]
}
