class StatusError extends Error {
  constructor(message: string, public status: number) {
    super(message)
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

export function assertOr500(
  condition: unknown,
  message = 'Server Error',
): asserts condition {
  if (!condition) {
    throw new StatusError(message, 500)
  }
}
