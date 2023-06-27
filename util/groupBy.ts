// deno-lint-ignore-file no-prototype-builtins no-explicit-any
export default function groupBy<T extends Record<string, any>>(
  array: T[],
  iteratee: (value: T) => string,
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = iteratee(item)
    if (result.hasOwnProperty(key)) {
      result[key].push(item)
    } else {
      result[key] = [item]
    }
    return result
  }, {} as Record<string, T[]>)
}
