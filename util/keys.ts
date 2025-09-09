// deno-lint-ignore-file no-explicit-any
export default function keys<T extends Record<string, any>>(
  obj: T,
): keyof T extends never ? [] : [keyof T, ...(keyof T)[]] {
  const keys = Object.keys(obj) as Array<keyof T>
  return keys as any
}
