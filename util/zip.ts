import { assert } from 'std/assert/assert.ts'

export default function* zip<T, U>(
  iterable1: Iterable<T>,
  iterable2: Iterable<U>,
): Generator<[T, U]> {
  const iter1 = iterable1[Symbol.iterator]()
  const iter2 = iterable2[Symbol.iterator]()
  while (true) {
    const result1 = iter1.next()
    const result2 = iter2.next()
    if (result1.done) {
      assert(result2.done, 'iterable2 is longer than iterable1')
    }
    if (result2.done) {
      assert(result1.done, 'iterable1 is longer than iterable2')
    }
    yield [result1.value, result2.value]
  }
}
