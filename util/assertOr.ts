import { assert } from 'std/assert/assert.ts'
import { ExtendedActionData, NonEmptyArray } from '../types.ts'
import { HttpError } from 'fresh'

export class AlertWithActionsError extends HttpError {
  expected = true

  constructor(
    message: string,
    actions: NonEmptyArray<ExtendedActionData>,
    level: 'error' | 'warning' | 'success' = 'error',
  ) {
    super(
      400,
      JSON.stringify({
        name: 'alert_with_actions',
        level,
        message,
        actions,
      }),
    )
  }
}

export class RedirectError extends Error {
  status = 302
  constructor(public location: string) {
    super('redirect')
  }
}

export function assertOr400(
  condition: unknown,
  message = 'Bad Request',
): asserts condition {
  if (!condition) {
    throw new HttpError(400, message)
  }
}

export function assertOr401(
  condition: unknown,
  message = 'Unauthorized',
): asserts condition {
  if (!condition) {
    throw new HttpError(401, message)
  }
}

export function assertOr403(
  condition: unknown,
  message = 'Forbidden',
): asserts condition {
  if (!condition) {
    throw new HttpError(403, message)
  }
}

export function assertOr404(
  condition: unknown,
  message = 'Not Found',
): asserts condition {
  if (!condition) {
    throw new HttpError(404, message)
  }
}

export function assertOr405(
  condition: unknown,
  message = 'Method Not Allowed',
): asserts condition {
  if (!condition) {
    throw new HttpError(405, message)
  }
}

export function assertOr409(
  condition: unknown,
  message = 'Conflict',
): asserts condition {
  if (!condition) {
    throw new HttpError(409, message)
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
  throw new RedirectError(location)
}

export function assertOr500(
  condition: unknown,
  message = 'Server Error',
): asserts condition {
  if (!condition) {
    throw new HttpError(500, message)
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
