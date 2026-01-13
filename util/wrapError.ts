export function wrapError(message: string, error: unknown): Error {
  const cause = error instanceof Error ? error : new Error(String(error))

  // The 'cause' property allows tools like Chrome DevTools and
  // Sentry to show the full "Chain" of errors.
  return new Error(message, { cause })
}
