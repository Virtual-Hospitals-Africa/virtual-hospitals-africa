// deno-lint-ignore-file no-explicit-any
type AnyObject = Record<string, any>

export default function pick<T extends AnyObject, K extends keyof T>(
  keys: K[],
): (obj: T) => Pick<T, K> {
  return function (obj: T) {
    const picked: AnyObject = {}
    for (const key of keys) {
      if (key in obj) {
        picked[key as any] = obj[key]
      }
    }
    return picked as Pick<T, K>
  }
}
