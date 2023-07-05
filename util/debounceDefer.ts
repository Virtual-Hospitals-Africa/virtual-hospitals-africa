// deno-lint-ignore-file no-explicit-any
// Like debounce from lodash, https://lodash.com/docs/4.17.15#debounce
// but always returns a promise that resolves with the result of a call that gets made after no further calls have been made for waitMillis.
export default function debounceDefer<Args extends Array<any>, Resolves>(
  fn: (...args: Args) => Promise<Resolves>,
  waitMillis: number
): (...args: Args) => Promise<Resolves> {
  let timer: any
  let resolving: null | Promise<Resolves>
  let resolve: any
  let reject: any

  return function (...args): any {
    if (timer) {
      clearTimeout(timer)
    }

    if (!resolving) {
      resolving = new Promise((rs, rj) => {
        resolve = rs
        reject = rj
      })
    }

    timer = setTimeout(function (): any {
      const resolveNow = resolve
      const rejectNow = reject

      timer = null
      resolving = null
      resolve = null
      reject = null

      fn(...args)
        .then(result => {
          resolveNow(result)
        })
        .catch(error => {
          rejectNow(error)
        })
    }, waitMillis)

    return resolving!
  }
}
