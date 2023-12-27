// deno-lint-ignore-file no-prototype-builtins no-explicit-any no-prototype-builtins
import isObjectLike from './isObjectLike.ts'

export default function deepRemoveHoles<
  T extends object,
>(obj: T): T {
  if (!isObjectLike(obj)) return obj as any
  if (Array.isArray(obj)) {
    return obj.filter((item: any) => item !== undefined) as any
  }
  const result: any = {}

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result[prop] = deepRemoveHoles(obj[prop] as any)
    }
  }

  return result
}
