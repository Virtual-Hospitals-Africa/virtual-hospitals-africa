// deno-lint-ignore-file no-explicit-any
type AnyObject = Record<string, any>

export default function omit<T extends AnyObject, K extends keyof T>(
  keys: K[],
): (obj: T) => Omit<T, K> {
  return function (obj: T) {
    const picked: AnyObject = {}
    for (const key in obj) {
      if (!keys.includes(key as any)) {
        picked[key as any] = obj[key]
      }
    }
    return picked as Omit<T, K>
  }
}
