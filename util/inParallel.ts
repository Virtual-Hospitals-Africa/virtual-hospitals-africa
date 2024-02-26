export default async function forEach<T>(
  generator: Iterable<T> | AsyncIterable<T>,
  fn: (item: T) => Promise<unknown>,
  { concurrency } = { concurrency: 10 },
): Promise<void> {
  let inFlight = 0
  let belowConcurrencyLimit = Promise.resolve()
  let resolveBelowConcurrencyLimit: () => void
  let resolveAllDone = () => {
    return
  }
  let allDone = new Promise<void>((resolve) => (resolveAllDone = resolve))

  let looping = true
  let errored = false

  for await (const item of generator) {
    if (errored) {
      break
    }
    await belowConcurrencyLimit
    inFlight++
    if (inFlight === concurrency) {
      belowConcurrencyLimit = new Promise<void>((
        resolve,
      ) => (resolveBelowConcurrencyLimit = resolve))
    }
    fn(item)
      .then(() => {
        inFlight--
        if (inFlight === 0 && !looping) {
          resolveAllDone()
        } else if (inFlight === concurrency - 1) {
          resolveBelowConcurrencyLimit()
        }
      })
      .catch((err) => {
        if (!errored) {
          errored = true
          allDone = Promise.reject(err)
        }
      })
  }

  looping = false
  if (inFlight === 0) {
    resolveAllDone()
  }
  return allDone
}

// Does not respect the order of the input iterable, hence the name collect instead of map
export async function collect<T, U>(
  generator: Iterable<T> | AsyncIterable<T>,
  fn: (item: T) => Promise<U>,
  { concurrency } = { concurrency: 10 },
): Promise<U[]> {
  const results: U[] = []
  await forEach(generator, async (item) => {
    results.push(await fn(item))
  }, { concurrency })
  return results
}

// Does not respect the order of the input iterable
export async function filter<T>(
  generator: Iterable<T> | AsyncIterable<T>,
  fn: (item: T) => Promise<boolean>,
  { concurrency } = { concurrency: 10 },
): Promise<T[]> {
  const results: T[] = []
  await forEach(generator, async (item) => {
    if (await fn(item)) {
      results.push(item)
    }
  }, { concurrency })
  return results
}
