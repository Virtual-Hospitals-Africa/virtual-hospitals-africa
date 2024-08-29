type PromiseProps<T> = {
  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]
}

export function promiseProps<T extends Record<string, unknown>>(
  obj: T,
): Promise<PromiseProps<T>> {
  const keys = Object.keys(obj) as Array<keyof T>
  const promises = keys.map((key) => Promise.resolve(obj[key]))

  return Promise.all(promises).then((results) => {
    // deno-lint-ignore no-explicit-any
    const resultObj: any = {}
    keys.forEach((key, i) => {
      resultObj[key] = results[i]
    })
    return resultObj as PromiseProps<T>
  })
}
