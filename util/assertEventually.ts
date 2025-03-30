import { Maybe } from '../types.ts'
import { assertOr404 } from './assertOr.ts'

export async function assertFoundEventually<T>(
  promise: Promise<Maybe<T>>,
): Promise<T> {
  const result = await promise
  assertOr404(result)
  return result
}
