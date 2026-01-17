/**
 * Gets the value at path of object. If the resolved value is undefined, the defaultValue is returned in its place.
 *
 * @param object - The object to query
 * @param path - The path of the property to get (string with dot notation or array of keys)
 * @param defaultValue - The value returned for undefined resolved values
 * @returns The resolved value
 *
 * @example
 * const obj = { a: { b: { c: 3 } } }
 * get(obj, 'a.b.c') // => 3
 * get(obj, ['a', 'b', 'c']) // => 3
 * get(obj, 'a.b.d', 'default') // => 'default'
 */
export function get<T = unknown>(
  object: unknown,
  path: string | (string | number)[],
  defaultValue?: T,
): T | undefined {
  if (object == null) {
    return defaultValue
  }

  const keys = Array.isArray(path) ? path : parsePath(path)

  let result: unknown = object
  for (const key of keys) {
    if (result == null) {
      return defaultValue
    }
    result = (result as Record<string | number, unknown>)[key]
  }

  return (result === undefined ? defaultValue : result) as T | undefined
}

/**
 * Parses a string path into an array of keys.
 * Handles dot notation and bracket notation: "a.b[0].c" => ["a", "b", "0", "c"]
 */
function parsePath(path: string): (string | number)[] {
  if (!path) return []

  const result: (string | number)[] = []
  const regex = /[^.[\]]+/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(path)) !== null) {
    const key = match[0]
    // Convert numeric strings to numbers for array access
    const num_key = Number(key)
    result.push(Number.isNaN(num_key) ? key : num_key)
  }

  return result
}
