import { assert } from 'std/assert/assert.ts'
import { NonEmptyArray } from '../types.ts'

export function arrayIsEmpty<T>(arr: T[]): arr is [] {
  return !arr.length
}

export function arrayIsNonEmpty<T>(arr: T[]): arr is NonEmptyArray<T> {
  return !!arr.length
}

export function assertArrayEmpty<T>(arr: T[]): asserts arr is [] {
  assert(!arr.length, 'Expected array to be empty')
}

export function assertArrayNonEmpty<T>(
  arr: T[],
  message?: string,
): asserts arr is NonEmptyArray<T> {
  assert(arr.length, message || 'Expected array to be nonempty')
}
