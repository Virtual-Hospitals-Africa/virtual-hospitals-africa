import s_expression from 's-expression'
import isString from '../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import * as schemas from './s_expression_schemas.ts' 
import { any_expression } from './s_expression_schemas.ts'

type SExpressionNode = {
  atom: string
  args: Array<string | SExpressionNode>
}

function recursiveFoo(parsed: SExpressionSimpleNode): SExpressionNode {
  assert(Array.isArray(parsed))
  const [atom, ...rest] = parsed

  assert(isString(atom))
  const args = rest.map(item => {
    if (isString(item)) return item
    if (Array.isArray(item)) return recursiveFoo(item)
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

  const first_pass = recursiveFoo(parsed)
  return schemas.any_expression.parse(first_pass)
}

export function parseExpressionExpectingAtom<
  T extends keyof typeof schemas
>(
  expression: string,
  atom: T,
): ReturnType<(typeof schemas)[T]['parse']> {
  const result = parseExpression(expression)
  if (result.atom === atom) {
    return result as ReturnType<(typeof schemas)[T]['parse']>
  }
  throw new Error(
    `Expected top-level node to be "${atom}", got: ${
      JSON.stringify(result.atom)
    }`,
  )
}

