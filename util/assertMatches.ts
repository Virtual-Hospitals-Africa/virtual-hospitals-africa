import { z } from 'zod'
import isDate from './isDate.ts'

function isZodType(value: unknown): value is z.ZodType {
  return value !== null &&
    typeof value === 'object' &&
    'safeParse' in value &&
    typeof value.safeParse === 'function'
}

function zodify(value: unknown, opts: { strict?: boolean } = {}): z.ZodType {
  // Already a Zod type, return as-is
  if (isZodType(value)) {
    return value
  }

  // Arrays become tuples with each element zodified
  if (Array.isArray(value)) {
    const elements = value.map((item) => zodify(item, opts))
    return elements.length
      ? z.tuple(elements as [z.ZodType, ...z.ZodType[]])
      : z.tuple([])
  }

  if (isDate(value)) {
    return z.date().refine((checking) => checking.valueOf() === value.valueOf())
  }

  // Objects get each value zodified
  if (typeof value === 'object' && value !== null) {
    const shape: Record<string, z.ZodType> = {}
    for (const key of Object.keys(value)) {
      shape[key] = zodify((value as Record<string, unknown>)[key])
    }
    const schema = z.object(shape)
    return opts.strict ? schema.strict() : schema
  }

  // deno-lint-ignore no-explicit-any
  return z.literal(value as any)
}

export function getAtPath(obj: unknown, path: PropertyKey[]): unknown {
  let value: unknown = obj
  for (const key of path) {
    if (value && typeof value === 'object') {
      value = (value as Record<PropertyKey, unknown>)[key]
    } else {
      return undefined
    }
  }
  return value
}

export function assertMatches(
  object: unknown,
  test: unknown,
  opts: { strict?: boolean } = {},
): void {
  const result = zodify(test, opts).safeParse(object)
  if (!result.success) {
    const issues = result.error.issues.map((issue) => (
      {
        ...issue,
        actual_value: getAtPath(object, issue.path),
      }
    ))
    throw new Error(JSON.stringify(issues, null, 2))
  }
}
