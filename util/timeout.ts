export class TimeoutError extends Error {
  constructor(millis: number) {
    super(`Timed out after ${millis}ms`)
  }
}

export function timeout<T>(millis: number): Promise<T> & {
  cancel(): void
} {
  const deferred = Promise.withResolvers<T>()
  const timer = setTimeout(
    () => deferred.reject(new TimeoutError(millis)),
    millis,
  )

  return Object.assign(deferred.promise, {
    cancel() {
      clearTimeout(timer)
    },
  })
}
