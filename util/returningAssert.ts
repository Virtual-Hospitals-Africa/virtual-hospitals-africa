export function returningAssert<T, U>(
  object: T,
  assertion: (obj: T) => asserts obj is T & U,
) {
  assertion(object)
  return object
}
