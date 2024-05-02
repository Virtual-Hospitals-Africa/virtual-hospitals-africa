export async function* take<T>(
  generator: AsyncGenerator<T>,
  count: number,
): AsyncGenerator<T> {
  let remaining = count
  for await (const item of generator) {
    if (remaining <= 0) break
    yield item
    remaining--
  }
}
