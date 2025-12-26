import s_expression from 's-expression'
import isString from '../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import * as schemas from './s_expression_schemas.ts'

type SExpressionNode = {
  atom: string
  args: Array<string | SExpressionNode>
}

function recursiveTreePass(parsed: SExpressionSimpleNode): SExpressionNode {
  assert(Array.isArray(parsed))
  const [atom, ...rest] = parsed

  assert(isString(atom))
  const args = rest.map((item) => {
    if (isString(item)) return item
    if (Array.isArray(item)) return recursiveTreePass(item)
    throw new Error(`Unexpected ${item}`)
  })

  return { atom, args }
}

type SExpressionSimpleNode = string | SExpressionSimpleNode[]

export function parseExpression(
  expression: string,
) {
  const parsed = s_expression(expression) as SExpressionSimpleNode
  if (parsed instanceof Error) {
    throw parsed
  }

  const first_pass = recursiveTreePass(parsed)
  try {
    return schemas.any_expression.parse(first_pass)
  } catch (err) {
    console.log(expression)
    throw new Error('failure to parse')
  }
}

export type ParsedExpression = ReturnType<typeof parseExpression>

export type Atom = ParsedExpression['atom']

export type ParsedExpressionOf<T extends Atom> = ParsedExpression & { atom: T }

export function isAtom<T extends Atom>(
  obj: ParsedExpression,
  atom: T,
): obj is ParsedExpressionOf<T> {
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
): ParsedExpression & { atom: T } {
  const parsed = s_expression(expression) as SExpressionSimpleNode
  if (parsed instanceof Error) {
    throw parsed
  }

  const first_pass = recursiveTreePass(parsed)

  const second_pass = schemaByAtom(atom).parse(first_pass)

  assert(isAtom(second_pass, atom))
  
  return second_pass
}
