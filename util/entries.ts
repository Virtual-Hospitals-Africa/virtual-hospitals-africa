// deno-lint-ignore-file no-explicit-any
export default function entries<T extends Record<string, any>>(
  obj: T,
) {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}
