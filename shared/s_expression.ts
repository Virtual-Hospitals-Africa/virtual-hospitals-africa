// @deno-types="../types/s-expression.d.ts"
import s_expression from 's-expression'
import isString from '../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import * as schemas from './s_expression_schemas.ts'

import isObjectLike from '../util/isObjectLike.ts'
import z from 'zod'
import { inverseSExpression } from './s_expression_inverse.ts'
import { positive_decimal, snomed_concept_id } from '../util/validators.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { Values } from '../types.ts'
import { wrapError } from '../util/wrapError.ts'
import { isTriageLevel } from './priorities.ts'
import { safeParseWithValues } from '../util/assertMatches.ts'
import { humanReadableJson } from '../util/humanReadableJson.ts'
import isKeyOf from '../util/isKeyOf.ts'

type SExpressionNode = {
  atom: string
  args: Array<string | SExpressionNode>
}

function recursiveTreePass(parsed: SExpressionSimpleNode): SExpressionNode {
  assert(Array.isArray(parsed))
  const [atom, ...rest] = parsed

  assert(isString(atom))
  const args = rest.map((item) => {
    // Seems redundant, but it's not! The s_expression library returns new String instead of string values
    if (isString(item)) return String(item)
    if (Array.isArray(item)) return recursiveTreePass(item)
    throw new Error(`Unexpected ${item}`)
  })

  return { atom, args }
}

type SExpressionSimpleNode = string | SExpressionSimpleNode[]

export function parseWithSchema<Schema extends Values<typeof schemas>>(
  expression: string | SExpressionSimpleNode,
  schema: Schema,
): z.infer<Schema> {
  assert(schema.description)
  const parsed = Array.isArray(expression) ? expression : s_expression(expression) as SExpressionSimpleNode
  if (parsed instanceof Error) {
    throw wrapError(`Error parsing ${expression}`, parsed)
  }
  assert(Array.isArray(parsed))
  const first_pass = recursiveTreePass(parsed)
  const second_pass = safeParseWithValues(schema, first_pass)
  if (!second_pass.success) {
    const issue = second_pass.error.issues[0]

    throw new Error(
      // deno-lint-ignore no-explicit-any
      `Error parsing ${expression} using schema ${schema.description}\npath: ${issue.path}\nsaw: ${humanReadableJson((issue as any).actual_value)}`,
    )
  }

  // This will slow things down temporarily, but I want to ensure that these functions work when exercised by real s_expressions
  const normal_form_by_inverse = inverseSExpression(second_pass.data)
  const normalized = fastNormalForm(normal_form_by_inverse)
  assertEquals(normal_form_by_inverse, normalized, `${normal_form_by_inverse} ; ${normalized}`)
  return second_pass.data
}

export function parseArrayWithSchema<Schema extends Values<typeof schemas>>(
  expression: string,
  schema: Schema,
): z.infer<Schema>[] {
  assert(expression.startsWith('(('), 'Expression must start with (( to be interpreted as an array of s expressions')
  const parsed = s_expression(expression)
  assert(Array.isArray(parsed))
  return parsed.map((s_expression) => parseWithSchema(s_expression, schema))
}

export type Atom = schemas.AnyNode['atom']

export function isAtom<T extends Atom>(
  obj: schemas.AnyNode,
  atom: T,
): obj is schemas.Lang[T] {
  return obj.atom === atom
}

function schemaByAtom(atom: string) {
  switch (atom) {
    case '>':
    case '<':
    case '>=':
    case '<=':
    case '=':
      return schemas.comparator
    default: {
      if (!isKeyOf(atom, schemas)) {
        console.log(schemas)
        throw new Error(`No schema for ${atom}`)
      }
      return schemas[atom]
    }
  }
}

export function parseExpressionExpectingAtom<
  T extends Atom,
>(
  expression: string,
  atom: T,
): schemas.Lang[T] {
  const parsed = parseWithSchema(expression, schemaByAtom(atom))
  assert(isAtom(parsed, atom))
  return parsed
}

export function asNode<
  T extends Atom,
>(
  expression: string | schemas.AnyNode,
  atom: T,
): schemas.Lang[T] {
  if (isObjectLike(expression)) {
    assert(isAtom(expression, atom))
    return expression
  }
  return parseExpressionExpectingAtom(expression, atom)
}

export function sExpressionZodValidator<Schema extends Values<typeof schemas>>(
  schema: Schema,
) {
  return z.string().transform((expression) => parseWithSchema(expression, schema))
}

export function normalForm(s_expression: string): string {
  const trimmed = s_expression.trim()
  const match = trimmed.match(/^\(([a-z|\d|_]+)\s/)
  assert(match, `${trimmed} is not an s expression${trimmed[0]}x`)
  const atom = match[1]
  const schema = schemaByAtom(atom)
  return inverseSExpression(parseWithSchema(trimmed, schema))
}

export function fastNormalForm(expr: string): string {
  const parsed = s_expression(expr) as SExpressionSimpleNode
  if (parsed instanceof Error) {
    throw parsed
  }
  assert(Array.isArray(parsed))
  return fastNormalize(parsed)
}

const UNITS = new Set([
  '%' as const,
  'bpm' as const,
  '°C' as const,
  'cm' as const,
  'kg' as const,
  'mmol/L' as const,
  'mmHg' as const,
])

export const UNITS_ARRAY = Array.from(UNITS)

export type Units = typeof UNITS_ARRAY[number]

export function fastNormalize([atom, ...rest]: Exclude<SExpressionSimpleNode, string>): string {
  if (rest.length === 0) return `(${atom})`
  const terms = rest.map((item, index) => {
    if (Array.isArray(item)) return fastNormalize(item)
    if (snomed_concept_id.safeParse(item).success) return String(item)
    if (positive_decimal.safeParse(item).success) return String(item)
    if (atom === 'measurement' && index === 1) {
      assert(UNITS.has(item as unknown as Units), `Update UNITS to include ${item}`)
      return item
    }
    if (atom === 'diagnosis' && index === 1) {
      return item
    }
    if (atom === 'system_diagnosis_rule' && index === 1) {
      return item
    }
    if (atom === 'task' && index === 1) {
      return item
    }
    if (atom === 'ages') {
      return item
    }
    if (atom === 'system_priority_determination' && index === 2) {
      assert(isTriageLevel(item))
      return item
    }
    if (isString(item)) return `"${item}"`
    throw new Error(`Unable to normalize ${item}`)
  }).join(' ')
  return `(${atom} ${terms})`
}
