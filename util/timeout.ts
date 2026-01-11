export function timeout(millis: number): Promise<void> & {
  cancel(): void
} {
  const deferred = Promise.withResolvers<void>()
  const timer = setTimeout(
    () => deferred.reject(new Error(`Timed out after ${millis}ms`)),
    millis,
  )

  return Object.assign(deferred.promise, {
    cancel() {
      clearTimeout(timer)
    },
  })
}
