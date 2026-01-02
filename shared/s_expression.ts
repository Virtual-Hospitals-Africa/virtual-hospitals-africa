import s_expression from 's-expression'
import isString from '../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import * as schemas from './s_expression_schemas.ts'
import { parseWithValues } from '../util/assertMatches.ts'
import isObjectLike from '../util/isObjectLike.ts'
import z from 'zod'
import { inverseSExpression } from './s_expression_inverse.ts'

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

export function firstPass(
  expression: string,
) {
  const parsed = s_expression(expression) as SExpressionSimpleNode
  if (parsed instanceof Error) {
    throw parsed
  }
  return recursiveTreePass(parsed)
}

export function parseExpression(
  expression: string,
) {
  const first_pass = firstPass(expression)
  try {
    return schemas.any_expression.parse(first_pass)
  } catch (_err) {
    console.log(expression)
    throw new Error('failure to parse')
  }
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
  const parsed = s_expression(expression) as SExpressionSimpleNode
  if (parsed instanceof Error) {
    throw parsed
  }

  const first_pass = recursiveTreePass(parsed)

  const schema = schemaByAtom(atom)

  const second_pass = parseWithValues(schema, first_pass)

  assert(isAtom(second_pass, atom))

  return second_pass
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
    .transform((expression) => {
      const first_pass = firstPass(expression)
      const schema = schemaByAtom(atom)
      const second_pass = parseWithValues(schema, first_pass)
      assert(isAtom(second_pass, atom))
      return second_pass
    })
}

export function normalForm(s_expression: string): string {
  return inverseSExpression(parseExpression(s_expression))
}
