// deno-lint-ignore-file no-prototype-builtins no-explicit-any no-prototype-builtins
import isObjectLike from './isObjectLike.ts'
type DeepOmit<T, K extends string | number | symbol> = T extends object
  ? T extends { [P in K]: any } ? Omit<T, K>
  : { [P in keyof T]: DeepOmit<T[P], K> }
  : T

export default function deepOmit<
  T extends object,
  K extends string | number | symbol,
>(obj: T, keys: K | K[]): DeepOmit<T, K> {
  if (!isObjectLike(obj)) return obj as any
  if (!Array.isArray(keys)) keys = [keys]
  if (Array.isArray(obj)) {
    return obj.map((item: any) => deepOmit(item as any, keys)) as any
  }

  const result: any = {}

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (keys.some((key) => prop === key)) {
        continue
      }
      result[prop] = deepOmit(obj[prop] as any, keys)
    }
  }

  return result
}
