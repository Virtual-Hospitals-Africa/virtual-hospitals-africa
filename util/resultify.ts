export type ResultSuccess<T> = [null, T]
export type ResultError = [Error, null]
export type Result<T> = ResultSuccess<T> | ResultError

export function resultify<T>(
  promise: Promise<T>,
): Promise<Result<T>> {
  return promise.then(
    (value) => [null, value] as ResultSuccess<T>,
    (error) => [error, null] as ResultError,
  )
}
