/**
 * Wraps a function in a try/catch that logs the arguments before re-throwing any error.
 */
// deno-lint-ignore no-explicit-any
export function logArgsOnError<T extends (...args: any[]) => any>(
  fn: T,
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    try {
      const result = fn(...args)
      if (result instanceof Promise) {
        return result.catch((error) => {
          console.log(args)
          throw error
        }) as ReturnType<T>
      }
      return result as ReturnType<T>
    } catch (error) {
      console.log(args)
      throw error
    }
  }) as T
}
