// https://stackoverflow.com/a/50587599/3973681
export async function* combineAsyncIterables<T>(
  iterables: AsyncIterable<T>[],
): AsyncGenerator<T> {
  // Worker function to queue up the next result
  // deno-lint-ignore no-explicit-any
  const queueNext = async (e: any) => {
    e.result = null // Release previous one as soon as possible
    e.result = await e.it.next()
    return e
  }
  // Map the generators to source objects in a map, get and start their
  // first iteration
  const sources = new Map(iterables.map((gen) => [
    gen,
    queueNext({
      key: gen,
      it: gen[Symbol.asyncIterator](),
    }),
  ]))
  // While we still have any sources, race the current promise of
  // the sources we have left
  while (sources.size) {
    const winner = await Promise.race(sources.values())
    // Completed the sequence?
    if (winner.result.done) {
      // Yes, drop it from sources
      sources.delete(winner.key)
    } else {
      // No, grab the value to yield and queue up the next
      // Then yield the value
      const { value } = winner.result
      sources.set(winner.key, queueNext(winner))
      yield value
    }
  }
}
