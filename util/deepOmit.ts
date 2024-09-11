// deno-lint-ignore-file no-prototype-builtins no-explicit-any no-prototype-builtins
import isObjectLike from './isObjectLike.ts'

type RemoveNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K] extends object
    ? RemoveNever<T[K]>
    : T[K]
}
type DeepOmit<T, K extends string> = T extends Array<infer U>
  ? Array<DeepOmit<U, K>>
  : T extends object ? RemoveNever<
      {
        [P in keyof T]: P extends K ? never : DeepOmit<T[P], K>
      }
    >
  : T

export default function deepOmit<
  T extends object,
  K extends string,
>(obj: T, keys: K[]): DeepOmit<T, K> {
  if (!isObjectLike(obj)) return obj as any
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
