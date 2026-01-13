import { MostlyJsonSerializable } from '../types.ts'
import { errorMessageWithJsonContext } from './errorMessageWithJsonContext.ts'

export function wrapError(message: string, error: unknown, context?: MostlyJsonSerializable): Error {
  const cause = error instanceof Error ? error : new Error(String(error))

  const full_message = context ? errorMessageWithJsonContext(message, context) : message

  // The 'cause' property allows tools like Chrome DevTools and
  // Sentry to show the full "Chain" of errors.
  return new Error(full_message, { cause })
}
