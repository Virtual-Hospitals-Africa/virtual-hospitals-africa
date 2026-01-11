import { z } from 'zod'
import isDate from './isDate.ts'
import { humanReadableJson } from './humanReadableJson.ts'
import { JsonSerializable } from '../types.ts'

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

export function safeParseWithValues<
  Schema extends z.ZodType<
    unknown,
    unknown,
    z.core.$ZodTypeInternals<unknown, unknown>
  >,
>(
  schema: Schema,
  object: unknown,
) {
  const result = schema.safeParse(object)
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const value = getAtPath(object, issue.path)
      Object.assign(issue, {
        actual_value: value === undefined ? '<undefined>' : value,
      })
    })
  }
  return result
}

export function parseWithValues<
  Schema extends z.ZodType<
    unknown,
    unknown,
    z.core.$ZodTypeInternals<unknown, unknown>
  >,
>(
  schema: Schema,
  object: unknown,
) {
  const result = safeParseWithValues(schema, object)
  if (result.success) return result.data
  throw new Error(
    humanReadableJson(result.error.issues as unknown as JsonSerializable),
  )
}

// deno-lint-ignore no-explicit-any
type Indexable = { [key: string]: any }

type Matched<T, Strict extends boolean> = T extends z.ZodType<infer O>
  ? Matched<O, Strict>
  : T extends readonly (infer E)[] ? Strict extends true ? Matched<E, Strict>[]
    : Matched<E, Strict>[] & Indexable
  : T extends object
    ? Strict extends true ? { [P in keyof T]: Matched<T[P], Strict> }
    : { [P in keyof T]: Matched<T[P], Strict> } & Indexable
  : T

export function assertMatches<T, Strict extends boolean = false>(
  object: unknown,
  test: T,
  opts: { strict?: Strict } = {},
): asserts object is Matched<T, Strict> {
  const schema = zodify(test, opts)
  parseWithValues(schema, object)
}
