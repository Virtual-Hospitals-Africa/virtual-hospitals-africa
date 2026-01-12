type PromiseProps<T> = {
  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]
}

export function promiseProps<T extends Record<string, unknown>>(
  obj: T,
): Promise<PromiseProps<T>> {
  const keys = Object.keys(obj) as Array<keyof T>
  const promises = keys.map((key) => Promise.resolve(obj[key]))

  return Promise.allSettled(promises).then((results) => {
    // deno-lint-ignore no-explicit-any
    const result_obj: any = {}
    keys.forEach((key, i) => {
      const result = results[i]
      if (result.status === 'rejected') {
        throw result.reason
      }
      result_obj[key] = result.value
    })
    return result_obj as PromiseProps<T>
  })
}
