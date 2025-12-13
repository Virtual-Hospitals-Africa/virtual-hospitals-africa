import s_expression from 's-expression'
import isString from '../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { arrayIsEmpty, assertArrayEmpty } from '../util/arraySize.ts'

export type ParsedFindingExpression = {
  type: 'finding'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedQualifierOrNotExpression =
  | ParsedQualifierExpression
  | ParsedNotExpression

export type ParsedQualifierExpression = {
  type: 'qualifier'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedNotExpression = {
  type: 'not'
  expression: ParsedExpression
}

export type ParsedOrExpression = {
  type: 'or'
  expressions: ParsedExpression[]
}

export type ParsedActiveConditionExpression = {
  type: 'active_condition'
  snomed_concept_id: string
}

export type ParsedExpression =
  | ParsedFindingExpression
  | ParsedQualifierExpression
  | ParsedNotExpression
  | ParsedOrExpression
  | ParsedActiveConditionExpression

export type ParsedExpressionNodeType = ParsedExpression['type']

export type SExpressionNode = string | SExpressionNode[]

const PARSERS = {
  finding: (node: SExpressionNode): ParsedFindingExpression => {
    assert(Array.isArray(node))
    const [type, snomed_concept_id, ...qualifiers] = node
    assertEquals(type, 'finding')
    if (typeof snomed_concept_id !== 'string') {
      throw new Error(
        `Expected snomed_concept_id to be a string, got: ${
          JSON.stringify(snomed_concept_id)
        }`,
      )
    }
    let value_snomed_concept_id: string | undefined
    if (isString(qualifiers[0])) {
      value_snomed_concept_id = qualifiers.shift() as string
    }
    return {
      type: 'finding',
      snomed_concept_id,
      value_snomed_concept_id: value_snomed_concept_id ?? null,
      qualifiers: qualifiers.map(parseArrayNode).map((parsed) => {
        assert(
          parsed.type === 'qualifier' || parsed.type === 'not',
          `Expected parsed to be a qualifier or not expression, got: ${
            JSON.stringify(parsed.type)
          }`,
        )
        return parsed
      }),
    }
  },
  qualifier: (node: SExpressionNode): ParsedQualifierExpression => {
    assert(Array.isArray(node))
    const [type, snomed_concept_id, ...rest] = node
    assertEquals(type, 'qualifier')
    if (typeof snomed_concept_id !== 'string') {
      throw new Error(
        `Expected snomed_concept_id to be a string, got: ${
          JSON.stringify(snomed_concept_id)
        }`,
      )
    }
    if (arrayIsEmpty(rest)) {
      return {
        type: 'qualifier',
        snomed_concept_id,
        value_snomed_concept_id: null,
        qualifiers: [],
      }
    }
    let value_snomed_concept_id: string | undefined
    if (isString(rest[0])) {
      value_snomed_concept_id = rest.shift() as string
    }
    return {
      type: 'qualifier',
      snomed_concept_id,
      value_snomed_concept_id: value_snomed_concept_id ?? null,
      qualifiers: rest.map(parseArrayNode).map((parsed) => {
        assert(
          parsed.type === 'qualifier' || parsed.type === 'not',
          `Expected parsed to be a qualifier or not expression, got: ${
            JSON.stringify(parsed.type)
          }`,
        )
        return parsed
      }),
    }
  },
  not: (node: SExpressionNode): ParsedNotExpression => {
    assert(Array.isArray(node))
    const [type, inner, ...rest] = node
    assertEquals(type, 'not')
    assertArrayEmpty(rest)
    if (!Array.isArray(inner)) {
      throw new Error(`Expected array, got: ${JSON.stringify(inner)}`)
    }

    return {
      type: 'not',
      expression: parseArrayNode(inner),
    }
  },
  or: (node: SExpressionNode): ParsedOrExpression => {
    assert(Array.isArray(node))
    const [type, ...expressions] = node
    assertEquals(type, 'or')
    assert(expressions.length >= 2)
    expressions.forEach((expression) => {
      if (!Array.isArray(expression)) {
        throw new Error(`Expected array, got: ${JSON.stringify(expression)}`)
      }
    })

    return {
      type: 'or',
      expressions: expressions.map(parseArrayNode),
    }
  },
  active_condition: (
    node: SExpressionNode,
  ): ParsedActiveConditionExpression => {
    assert(Array.isArray(node))
    const [type, snomed_concept_id, ...rest] = node
    assertEquals(type, 'active_condition')
    if (typeof snomed_concept_id !== 'string') {
      throw new Error(
        `Expected snomed_concept_id to be a string, got: ${
          JSON.stringify(snomed_concept_id)
        }`,
      )
    }
    assert(arrayIsEmpty(rest))

    return {
      type: 'active_condition',
      snomed_concept_id,
    }
  },
}

const FROM_PARSERS = {
  finding: (parsed: ParsedFindingExpression): string => {
    const qualifiers = parsed.qualifiers.map(fromParsedExpression).join(' ')
    return qualifiers
      ? `(${parsed.type} ${parsed.snomed_concept_id} ${qualifiers})`
      : `(${parsed.type} ${parsed.snomed_concept_id})`
  },
  qualifier: (parsed: ParsedQualifierExpression): string => {
    const qualifiers = parsed.qualifiers.map(fromParsedExpression).join(' ')
    return qualifiers
      ? `(${parsed.type} ${parsed.snomed_concept_id} ${qualifiers})`
      : `(${parsed.type} ${parsed.snomed_concept_id})`
  },
  not: (parsed: ParsedNotExpression): string =>
    `(not ${fromParsedExpression(parsed.expression)})`,
  or: (parsed: ParsedOrExpression): string =>
    `(or  ${parsed.expressions.map(fromParsedExpression).join(' ')})`,
  active_condition: (parsed: ParsedActiveConditionExpression): string =>
    `(active_condition  ${parsed.snomed_concept_id})`,
}

function parseArrayNode(node: SExpressionNode): ParsedExpression {
  assert(Array.isArray(node))
  const parser = PARSERS[node[0] as keyof typeof PARSERS]
  if (!parser) {
    throw new Error(`Unknown node type: ${JSON.stringify(node[0])}`)
  }
  return parser(node)
}

export function parseExpression(
  expression: string,
): ParsedExpression {
  const parsed = s_expression(expression)
  if (parsed instanceof Error) {
    throw parsed
  }
  return parseArrayNode(parsed)
}

export function parseFindingExpression(
  expression: string,
): ParsedFindingExpression {
  const result = parseExpression(expression)
  if (result.type !== 'finding') {
    throw new Error(
      `Expected top-level node to be "finding", got: ${
        JSON.stringify(result.type)
      }`,
    )
  }
  return result
}

export function parseQualifierExpression(
  expression: string,
): ParsedQualifierExpression {
  const result = parseExpression(expression)
  if (result.type !== 'qualifier') {
    throw new Error(
      `Expected top-level node to be "qualifier", got: ${
        JSON.stringify(result.type)
      }`,
    )
  }
  return result
}

export function fromParsedExpression(parsed: ParsedExpression): string {
  // deno-lint-ignore no-explicit-any
  return FROM_PARSERS[parsed.type](parsed as any)
}
