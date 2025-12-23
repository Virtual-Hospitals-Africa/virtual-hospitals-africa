import s_expression from 's-expression'
import isString from '../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { arrayIsEmpty, assertArrayEmpty } from '../util/arraySize.ts'
import compact from '../util/compact.ts'
import assertOneOf from '../util/assertOneOf.ts'

export type ParsedFindingExpression = {
  type: 'finding'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedProcedureExpression = {
  type: 'procedure'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedEvaluationExpression = {
  type: 'evaluation'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  // evaluates: ParsedEvaluatesExpression
  qualifiers: ParsedQualifierOrNotExpression[]
}

// export type ParsedEvaluatesExpression = {
//   type: 'evaluates'
//   expression: ParsedExpression
// }

export type ParsedMeasurementExpression = {
  type: 'measurement'
  snomed_concept_id: string
  units?: ParsedUnitsExpression
}

export type ParsedUnitsExpression = {
  type: 'units'
  value: number
  units: string
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
export type ParsedTaskExpression = {
  type: 'task'
  if_expression: ParsedExpression
  tasks: ParsedProcedureExpression[]
}

export type ParsedNotExpression = {
  type: 'not'
  expression: ParsedExpression
}

export type ParsedOrExpression = {
  type: 'or'
  expressions: ParsedExpression[]
}

export type ParsedAndExpression = {
  type: 'and'
  expressions: ParsedExpression[]
}

export type ParsedActiveConditionExpression = {
  type: 'active_condition'
  snomed_concept_id: string
}

export type ParsedComparatorExpression<Comparator extends string> = {
  type: Comparator
  left: ParsedMeasurementExpression
  right: ParsedUnitsExpression /*| ParsedMeasurementExpression */
}

export type ParsedComparatorExpressions =
  | ParsedComparatorExpression<'>'>
  | ParsedComparatorExpression<'<'>
  | ParsedComparatorExpression<'>='>
  | ParsedComparatorExpression<'<='>
  | ParsedComparatorExpression<'='>

export type ParsedExpression =
  | ParsedFindingExpression
  | ParsedProcedureExpression
  | ParsedEvaluationExpression
  // | ParsedEvaluatesExpression
  | ParsedQualifierExpression
  | ParsedTaskExpression
  | ParsedMeasurementExpression
  | ParsedUnitsExpression
  | ParsedNotExpression
  | ParsedOrExpression
  | ParsedAndExpression
  | ParsedActiveConditionExpression
  | ParsedComparatorExpressions

export type ParsedExpressionNodeType = ParsedExpression['type']

export type SExpressionNode = string | SExpressionNode[]

const PARSERS = {
  // TODO "qualifier" can be that a finding was done as part of a particular procedure?
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
  procedure: (node: SExpressionNode): ParsedProcedureExpression => {
    assert(Array.isArray(node))
    const [type, snomed_concept_id, ...qualifiers] = node
    assertEquals(type, 'procedure')
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
      type: 'procedure',
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
  evaluation: (node: SExpressionNode): ParsedEvaluationExpression => {
    assert(Array.isArray(node))
    const [type, snomed_concept_id, ...qualifiers] = node
    assertEquals(type, 'evaluation')
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
    // const evaluates_expression = qualifiers.shift()
    // assert(evaluates_expression)
    // assert(Array.isArray(evaluates_expression))
    return {
      type: 'evaluation',
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
  // evaluates: (node: SExpressionNode): ParsedEvaluatesExpression => {
  //   assert(Array.isArray(node))
  //   const [type, expression] = node
  //   assertEquals(type, 'evaluates')
  //   assert(Array.isArray(expression))
  //   return {
  //     type: 'evaluates',
  //     expression: parseArrayNode(expression),
  //   }
  // },
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
  and: (node: SExpressionNode): ParsedAndExpression => {
    assert(Array.isArray(node))
    const [type, ...expressions] = node
    assertEquals(type, 'and')
    assert(expressions.length >= 2)
    expressions.forEach((expression) => {
      if (!Array.isArray(expression)) {
        throw new Error(`Expected array, got: ${JSON.stringify(expression)}`)
      }
    })

    return {
      type: 'and',
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
  task: (
    node: SExpressionNode,
  ): ParsedTaskExpression => {
    assert(Array.isArray(node))
    const [type, if_expression, ...tasks] = node
    assertEquals(type, 'task')
    assert(Array.isArray(if_expression))
    assert(Array.isArray(tasks))

    return {
      type: 'task',
      if_expression: parseArrayNode(if_expression),
      tasks: tasks.map(PARSERS.procedure),
    }
  },
  measurement: (
    node: SExpressionNode,
  ): ParsedMeasurementExpression => {
    assert(Array.isArray(node))
    const [type, snomed_concept_id, ...rest] = node
    assertEquals(type, 'measurement')
    assert(isString(snomed_concept_id))

    let units: ParsedUnitsExpression | undefined
    if (rest.length > 0) {
      const parsed = parseArrayNode(rest[0])
      assert(
        parsed.type === 'units',
        `measurement can only have units child, got: ${parsed.type}`,
      )
      units = parsed
      assertArrayEmpty(rest.slice(1))
    } else {
      assertArrayEmpty(rest)
    }

    return {
      type: 'measurement',
      snomed_concept_id,
      units,
    }
  },
  units: (
    node: SExpressionNode,
  ): ParsedUnitsExpression => {
    assert(Array.isArray(node))
    const [type, value_string, units, ...rest] = node
    assertEquals(type, 'units')
    assert(isString(value_string))
    const value = parseFloat(value_string)
    assert(!isNaN(value))
    assert(isString(units))

    assertArrayEmpty(rest)

    return {
      type: 'units',
      value,
      units,
    }
  },
  '>': (
    node: SExpressionNode,
  ): ParsedComparatorExpression<'>'> => {
    assert(Array.isArray(node))
    const [type, left, right_expr, ...rest] = node
    assertEquals(type, '>')
    assert(Array.isArray(left))
    assert(Array.isArray(right_expr))
    assertArrayEmpty(rest)
    const right = parseArrayNode(right_expr)
    assertOneOf(right.type, ['units' as const])

    return {
      type: '>',
      left: PARSERS.measurement(left),
      right,
    }
  },
  '<': (
    node: SExpressionNode,
  ): ParsedComparatorExpression<'<'> => {
    assert(Array.isArray(node))
    const [type, left, right_expr, ...rest] = node
    assertEquals(type, '<')
    assert(Array.isArray(left))
    assert(Array.isArray(right_expr))
    assertArrayEmpty(rest)
    const right = parseArrayNode(right_expr)
    assertOneOf(right.type, ['units' as const])

    return {
      type: '<',
      left: PARSERS.measurement(left),
      right,
    }
  },
  '>=': (
    node: SExpressionNode,
  ): ParsedComparatorExpression<'>='> => {
    assert(Array.isArray(node))
    const [type, left, right_expr, ...rest] = node
    assertEquals(type, '>=')
    assert(Array.isArray(left))
    assert(Array.isArray(right_expr))
    assertArrayEmpty(rest)
    const right = parseArrayNode(right_expr)
    assertOneOf(right.type, ['units' as const])

    return {
      type: '>=',
      left: PARSERS.measurement(left),
      right,
    }
  },
  '<=': (
    node: SExpressionNode,
  ): ParsedComparatorExpression<'<='> => {
    assert(Array.isArray(node))
    const [type, left, right_expr, ...rest] = node
    assertEquals(type, '<=')
    assert(Array.isArray(left))
    assert(Array.isArray(right_expr))
    assertArrayEmpty(rest)
    const right = parseArrayNode(right_expr)
    assertOneOf(right.type, ['units' as const])

    return {
      type: '<=',
      left: PARSERS.measurement(left),
      right,
    }
  },
  '=': (
    node: SExpressionNode,
  ): ParsedComparatorExpression<'='> => {
    assert(Array.isArray(node))
    const [type, left, right_expr, ...rest] = node
    assertEquals(type, '=')
    assert(Array.isArray(left))
    assert(Array.isArray(right_expr))
    assertArrayEmpty(rest)
    const right = parseArrayNode(right_expr)
    assertOneOf(right.type, ['units' as const])

    return {
      type: '=',
      left: PARSERS.measurement(left),
      right,
    }
  },
} satisfies {
  [T in ParsedExpression['type']]: unknown
}

const FROM_PARSERS = {
  finding: (parsed: ParsedFindingExpression): string => {
    const qualifiers = parsed.qualifiers.map(fromParsedExpression)

    return '(' + compact([
      parsed.type,
      parsed.snomed_concept_id,
      parsed.value_snomed_concept_id,
      ...qualifiers,
    ]).join(' ') + ')'
  },
  qualifier: (parsed: ParsedQualifierExpression): string => {
    const qualifiers = parsed.qualifiers.map(fromParsedExpression)

    return '(' + compact([
      parsed.type,
      parsed.snomed_concept_id,
      parsed.value_snomed_concept_id,
      ...qualifiers,
    ]).join(' ') + ')'
  },
  procedure: (parsed: ParsedProcedureExpression): string => {
    const qualifiers = parsed.qualifiers.map(fromParsedExpression)
    return '(' + compact([
      parsed.type,
      parsed.snomed_concept_id,
      parsed.value_snomed_concept_id,
      ...qualifiers,
    ]).join(' ') + ')'
  },
  evaluation: (parsed: ParsedEvaluationExpression): string => {
    const qualifiers = parsed.qualifiers.map(fromParsedExpression)
    return '(' + compact([
      parsed.type,
      parsed.snomed_concept_id,
      parsed.value_snomed_concept_id,
      // FROM_PARSERS.evaluates(parsed.evaluates),
      ...qualifiers,
    ]).join(' ') + ')'
  },
  // evaluates: (parsed: ParsedEvaluatesExpression): string =>
  //   `(evaluates ${fromParsedExpression(parsed.expression)})`,
  not: (parsed: ParsedNotExpression): string =>
    `(not ${fromParsedExpression(parsed.expression)})`,
  or: (parsed: ParsedOrExpression): string =>
    `(or  ${parsed.expressions.map(fromParsedExpression).join(' ')})`,
  and: (parsed: ParsedAndExpression): string =>
    `(and ${parsed.expressions.map(fromParsedExpression).join(' ')})`,
  task: (parsed: ParsedTaskExpression): string =>
    `(task ${fromParsedExpression(parsed.if_expression)} ${
      parsed.tasks.map(fromParsedExpression).join(' ')
    })`,
  measurement: (parsed: ParsedMeasurementExpression): string =>
    parsed.units
      ? `(measurement ${parsed.snomed_concept_id} ${
        FROM_PARSERS.units(parsed.units)
      })`
      : `(measurement ${parsed.snomed_concept_id})`,
  units: (parsed: ParsedUnitsExpression): string =>
    `(units ${parsed.value} ${parsed.units})`,
  active_condition: (parsed: ParsedActiveConditionExpression): string =>
    `(active_condition  ${parsed.snomed_concept_id})`,
  '>': (parsed: ParsedComparatorExpression<'>'>): string =>
    `(> ${fromParsedExpression(parsed.left)} ${
      fromParsedExpression(parsed.right)
    })`,
  '<': (parsed: ParsedComparatorExpression<'<'>): string =>
    `(< ${fromParsedExpression(parsed.left)} ${
      fromParsedExpression(parsed.right)
    })`,
  '>=': (parsed: ParsedComparatorExpression<'>='>): string =>
    `(>= ${fromParsedExpression(parsed.left)} ${
      fromParsedExpression(parsed.right)
    })`,
  '<=': (parsed: ParsedComparatorExpression<'<='>): string =>
    `(<= ${fromParsedExpression(parsed.left)} ${
      fromParsedExpression(parsed.right)
    })`,
  '=': (parsed: ParsedComparatorExpression<'='>): string =>
    `(= ${fromParsedExpression(parsed.left)} ${
      fromParsedExpression(parsed.right)
    })`,
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

export function parseExpressionExpectingType<
  T extends ParsedExpression['type'],
>(
  expression: string,
  type: T,
): ParsedExpression & { type: T } {
  const result = parseExpression(expression)
  if (result.type === type) {
    return result as ParsedExpression & { type: T }
  }
  throw new Error(
    `Expected top-level node to be "${type}", got: ${
      JSON.stringify(result.type)
    }`,
  )
}

export function parseFindingExpression(
  expression: string,
): ParsedFindingExpression {
  return parseExpressionExpectingType(expression, 'finding')
}

export function parseQualifierExpression(
  expression: string,
): ParsedQualifierExpression {
  return parseExpressionExpectingType(expression, 'qualifier')
}

export function fromParsedExpression(parsed: ParsedExpression): string {
  // deno-lint-ignore no-explicit-any
  return FROM_PARSERS[parsed.type](parsed as any)
}
