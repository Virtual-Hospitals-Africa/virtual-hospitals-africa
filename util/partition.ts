export default function partition<T, U = T>(
  array: (T | U)[],
  predicate: U extends T ? (item: T) => boolean : (item: T | U) => item is T,
): [T[], U[]] {
  const passes = [] as T[]
  const fails = [] as U[]
  for (const item of array) {
    // deno-lint-ignore no-explicit-any
    if (predicate(item as any)) {
      passes.push(item as T)
    } else {
      fails.push(item as U)
    }
  }
  return [passes, fails]
}
