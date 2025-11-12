// deno-lint-ignore no-explicit-any
export default function isShallowEqual<T extends Record<string, any>>(
  obj1: T,
  obj2: T,
): boolean {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}
