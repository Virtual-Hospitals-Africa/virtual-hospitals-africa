export type Result<T> = { success: true; value: T } | {
  success: false
  error: Error
}

export function asResult<T>(callback: () => T): Result<T> {
  try {
    const value = callback()
    return { success: true, value }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
