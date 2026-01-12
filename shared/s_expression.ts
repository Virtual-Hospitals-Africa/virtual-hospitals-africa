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

function parseExpressionBase<Schema extends Values<typeof schemas>>(
  expression: string,
  schema: Schema,
) {
  try {
    const parsed = s_expression(expression) as SExpressionSimpleNode
    if (parsed instanceof Error) {
      throw parsed
    }
    assert(Array.isArray(parsed))
    const first_pass = recursiveTreePass(parsed)
    const second_pass = schema.parse(first_pass)

    // This will slow things down temporarily, but I want to ensure that these functions work when exercised by real s_expressions
    const normal_form_by_inverse = inverseSExpression(second_pass)
    const normalized = normalForm(normal_form_by_inverse)
    assertEquals(normal_form_by_inverse, normalized)
    return second_pass
  } catch (err) {
    const msg = `failure to parse ${expression} as ${schema.description}\n`
    if (err instanceof Error) {
      err.message = msg + err.message
      throw err
    }
    console.error(msg)
    throw err
  }
}

export function parseExpression(
  expression: string,
) {
  return parseExpressionBase(expression, schemas.any_expression)
}

export type Atom = schemas.AnyNode['atom']

export function isAtom<T extends Atom>(
  obj: schemas.AnyNode,
  atom: T,
): obj is schemas.Lang[T] {
  return obj.atom === atom
}

function schemaByAtom(atom: Atom) {
  switch (atom) {
    case '>':
    case '<':
    case '>=':
    case '<=':
    case '=':
      return schemas.comparator
    default:
      return schemas[atom]
  }
}

export function parseExpressionExpectingAtom<
  T extends Atom,
>(
  expression: string,
  atom: T,
): schemas.Lang[T] {
  const parsed = parseExpressionBase(expression, schemaByAtom(atom))
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

export function sExpressionZodValidator<T extends Atom>(atom: T) {
  return z.string()
    .transform((expression) => parseExpressionExpectingAtom(expression, atom))
}

// function normalFormRoundTrip(s_expression: string): string {
//   return inverseSExpression(parseExpression(s_expression))
// }

export function normalForm(expr: string): string {
  const parsed = s_expression(expr) as SExpressionSimpleNode
  if (parsed instanceof Error) {
    throw parsed
  }
  assert(Array.isArray(parsed))
  return fastNormalize(parsed)
}

const UNITS = new Set([
  '%',
  'bpm',
  '°C',
  'cm',
  'kg',
  'mg/dL',
  'mmHg',
])

function fastNormalize([atom, ...rest]: Exclude<SExpressionSimpleNode, string>): string {
  if (rest.length === 0) return `(${atom})`
  const terms = rest.map((item, index) => {
    if (Array.isArray(item)) return fastNormalize(item)
    if (snomed_concept_id.safeParse(item).success) return String(item)
    if (positive_decimal.safeParse(item).success) return String(item)
    if (atom === 'units' && index === 1) {
      assert(UNITS.has(item as string), `Update UNITS to include ${item}`)
      return item
    }
    if (isString(item)) return `"${item}"`
    throw new Error(`Unable to normalize ${item}`)
  }).join(' ')
  return `(${atom} ${terms})`
}
