import { assert } from 'std/testing/asserts.ts'

export default function sample<T>(array: T[]): T {
  assert(array.length > 0)
  return array[Math.floor(Math.random() * array.length)]
}
