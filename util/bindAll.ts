// deno-lint-ignore-file no-explicit-any
export function bindAll<T extends object>(
  instance: T,
): T {
  for (const key of Object.getOwnPropertyNames(instance)) {
    const value = (instance as any)[key]
    if (typeof value === 'function') {
      ;(instance as any)[key] = value.bind(instance)
    }
  }
  return instance
}
