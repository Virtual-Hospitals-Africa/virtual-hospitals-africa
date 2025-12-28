import { assert } from 'std/assert/assert.ts'
import { ExtendedActionData, NonEmptyArray } from '../types.ts'

export class StatusError extends Error {
  location?: string
  constructor(message: string, public status: number) {
    super(message)
  }
}

export class AlertWithActionsError extends StatusError {
  expected = true

  constructor(
    message: string,
    actions: NonEmptyArray<ExtendedActionData>,
    level: 'error' | 'warning' | 'success' = 'error',
  ) {
    super(
      JSON.stringify({
        name: 'alert_with_actions',
        level,
        message,
        actions,
      }),
      400,
    )
  }
}

export function assertOr400(
  condition: unknown,
  message = 'Bad Request',
): asserts condition {
  if (!condition) {
    throw new StatusError(message, 400)
  }
}

export function assertOr401(
  condition: unknown,
  message = 'Unauthorized',
): asserts condition {
  if (!condition) {
    throw new StatusError(message, 401)
  }
}

export function assertOr403(
  condition: unknown,
  message = 'Forbidden',
): asserts condition {
  if (!condition) {
    throw new StatusError(message, 403)
  }
}

export function assertOr404(
  condition: unknown,
  message = 'Not Found',
): asserts condition {
  if (!condition) {
    throw new StatusError(message, 404)
  }
}

export function assertOr405(
  condition: unknown,
  message = 'Method Not Allowed',
): asserts condition {
  if (!condition) {
    throw new StatusError(message, 405)
  }
}

export function assertOrRedirect(
  condition: unknown,
  location: string,
): asserts condition {
  if (condition) return
  if (location.startsWith('http')) {
    assert(location.startsWith('https'), 'Redirect to plain http not allowed')
  } else {
    assert(
      location.startsWith('/'),
      'Redirect to non-absolute path not allowed',
    )
  }
  const error = new StatusError('redirect', 302)
  error.location = location
  throw error
}

export function assertOr500(
  condition: unknown,
  message = 'Server Error',
): asserts condition {
  if (!condition) {
    throw new StatusError(message, 500)
  }
}

export function assertOrAlertWithActions(
  condition: unknown,
  message: string,
  actions: NonEmptyArray<ExtendedActionData>,
  level: 'error' | 'warning' | 'success' = 'error',
): asserts condition {
  if (!condition) {
    throw new AlertWithActionsError(message, actions, level)
  }
}
