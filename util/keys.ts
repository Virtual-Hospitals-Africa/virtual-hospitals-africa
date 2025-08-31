// deno-lint-ignore no-explicit-any
export function keys<T extends Record<string, any>>(
  obj: T,
): keyof T extends never ? [] : [keyof T, ...(keyof T)[]] {
  const keys = Object.keys(obj) as Array<keyof T>
  // deno-lint-ignore no-explicit-any
  return keys as any // Type assertion needed here due to complexity
}
