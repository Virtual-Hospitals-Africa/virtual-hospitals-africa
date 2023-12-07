// deno-lint-ignore-file no-prototype-builtins no-explicit-any no-prototype-builtins
import isObjectLike from './isObjectLike.ts'
type DeepOmit<T, K extends string | number | symbol> = T extends object
  ? T extends { [P in K]: any } ? Omit<T, K>
  : { [P in keyof T]: DeepOmit<T[P], K> }
  : T

export default function deepOmit<
  T extends object,
  K extends string | number | symbol,
>(obj: T, key: K): DeepOmit<T, K> {
  if (!isObjectLike(obj)) return obj as any
  if (Array.isArray(obj)) {
    return obj.map((item: any) => deepOmit(item as any, key as any)) as any
  }
  const result: any = {}

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (prop === key as any) {
        continue
      }
      result[prop] = deepOmit(obj[prop] as any, key as any)
    }
  }

  return result
}
