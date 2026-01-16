import { Failure, Result, Success } from '../types.ts'

export function asResult<T>(callback: () => T): Result<T> {
  try {
    const value = callback()
    return { success: true, value }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

export async function asResultAsync<T>(
  callback: () => Promise<T>,
): Promise<Result<T>> {
  try {
    const value = await callback()
    return { success: true, value }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

export function isSuccess<T, R extends Result<T>>(
  result: R,
): result is R & Success<T> {
  return result.success
}

export function isFailure<T, R extends Result<T>>(
  result: R,
): result is R & Failure {
  return !result.success
}
