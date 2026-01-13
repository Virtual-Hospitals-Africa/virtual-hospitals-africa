export function without<T, W extends T>(
  array: T[],
  ...exclude: W[]
): Array<Exclude<T, W>> {
  // deno-lint-ignore no-explicit-any
  return array.filter((item) => !exclude.includes(item as any)) as Array<
    Exclude<T, W>
  >
}
