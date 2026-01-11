/**
 * Creates a function that is restricted to invoking `fn` once.
 * Repeat calls return the value of the first invocation.
 */

export function once<T>(fn: () => T): (() => T) & { readonly called: boolean } {
  let called = false
  let result: T

  const onceified = () => {
    if (!called) {
      called = true
      result = fn()
    }
    return result
  }

  Object.defineProperty(onceified, 'called', {
    get() {
      return called
    },
  })

  return onceified as (() => T) & { readonly called: boolean }
}
