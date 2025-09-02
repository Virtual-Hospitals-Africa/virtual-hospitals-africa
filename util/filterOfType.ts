export default function filterOfType<T, U>(
  array: T[],
  // deno-lint-ignore no-explicit-any
  predicate: (item: any) => item is U,
): Array<T & U> {
  const result: Array<T & U> = []
  for (const item of array) {
    if (predicate(item)) {
      result.push(item)
    }
  }
  return result
}
