// @deno-types="../types/s-expression.d.ts"
import s_expression from 's-expression'
import isString from '../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import { AnyNode } from './s_expression_schemas.ts'
import * as schemas from './s_expression_schemas.ts'

import isObjectLike from '../util/isObjectLike.ts'
import z from 'zod'
import { inverseSExpression } from './s_expression_inverse.ts'
import { positive_decimal, snomed_concept_id } from '../util/validators.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { Values } from '../types.ts'
import { wrapError } from '../util/wrapError.ts'

import { getAtPath, safeParseWithValues } from '../util/assertMatches.ts'
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

function formatSimpleStringArg(s: unknown): string {
  // The s-expression library returns quoted strings as `new String(...)` (object) and
  // unquoted atoms as plain string primitives. Preserve that distinction in output.
  return typeof s === 'object' ? `"${s}"` : String(s)
}

// deno-lint-ignore no-explicit-any
type RawSimpleNode = any[]

type Offender =
  | { kind: 'atom'; parent: RawSimpleNode }
  | { kind: 'arg'; parent: RawSimpleNode; argIndex: number }

function isLeafSimpleNode(node: RawSimpleNode): boolean {
  for (let i = 1; i < node.length; i++) {
    if (Array.isArray(node[i])) return false
  }
  return true
}

function findOffender(
  root: SExpressionSimpleNode,
  path: ReadonlyArray<PropertyKey>,
): Offender | null {
  if (!Array.isArray(root)) return null
  let last_array: RawSimpleNode = root
  let last_numeric_key: number | null = null
  let current: unknown = root
  for (const key of path) {
    if (key === 'args') continue
    if (typeof key === 'number') {
      if (!Array.isArray(current)) break
      // args[i] in the tree corresponds to current[i + 1] (current[0] is the atom)
      const next: unknown = current[key + 1]
      if (next === undefined) break
      current = next
      if (Array.isArray(current)) {
        last_array = current
        last_numeric_key = null
      } else {
        last_numeric_key = key
      }
      continue
    }
    if (key === 'atom' && Array.isArray(current)) {
      return { kind: 'atom', parent: current }
    }
    break
  }
  if (last_numeric_key !== null) {
    return { kind: 'arg', parent: last_array, argIndex: last_numeric_key }
  }
  return { kind: 'atom', parent: last_array }
}

function formatSimpleNode(
  node: unknown,
  indent: number,
  offender: Offender | null,
): string[] {
  const pad = ' '.repeat(indent)
  if (!Array.isArray(node)) {
    return [`${pad}${formatSimpleStringArg(node)}`]
  }
  const atom_str = String(node[0])

  if (isLeafSimpleNode(node)) {
    const arg_strs: string[] = []
    for (let i = 1; i < node.length; i++) {
      arg_strs.push(formatSimpleStringArg(node[i]))
    }
    const suffix = arg_strs.length ? ` ${arg_strs.join(' ')}` : ''
    const lines = [`${pad}(${atom_str}${suffix})`]
    if (offender && offender.parent === node) {
      if (offender.kind === 'atom') {
        lines.push(`${' '.repeat(indent + 1)}^ Error`)
      } else {
        let column = indent + 1 + atom_str.length
        for (let k = 0; k < offender.argIndex; k++) {
          column += 1 + arg_strs[k].length
        }
        column += 1
        lines.push(`${' '.repeat(column)}^ Error`)
      }
    }
    return lines
  }

  const lines: string[] = [`${pad}(${atom_str}`]
  if (offender && offender.parent === node && offender.kind === 'atom') {
    lines.push(`${' '.repeat(indent + 1)}^ Error`)
  }
  for (let i = 1; i < node.length; i++) {
    const child = node[i]
    lines.push(...formatSimpleNode(child, indent + 2, offender))
    if (
      offender &&
      offender.parent === node &&
      offender.kind === 'arg' &&
      offender.argIndex === i - 1 &&
      !Array.isArray(child)
    ) {
      lines.push(`${' '.repeat(indent + 2)}^ Error`)
    }
  }
  lines.push(`${pad})`)
  return lines
}

function collectAllIssues(
  issues: ReadonlyArray<z.core.$ZodIssue>,
  base_path: ReadonlyArray<PropertyKey>,
): Array<{ path: PropertyKey[]; issue: z.core.$ZodIssue }> {
  const result: Array<{ path: PropertyKey[]; issue: z.core.$ZodIssue }> = []
  for (const issue of issues) {
    const full_path: PropertyKey[] = [...base_path, ...issue.path]
    result.push({ path: full_path, issue })
    // deno-lint-ignore no-explicit-any
    const a = issue as any
    const errors = a.errors as ReadonlyArray<ReadonlyArray<z.core.$ZodIssue>> | undefined
    if (errors) {
      for (const branch of errors) {
        result.push(...collectAllIssues(branch, full_path))
      }
    }
    const union_errors = a.unionErrors as ReadonlyArray<{ issues: ReadonlyArray<z.core.$ZodIssue> }> | undefined
    if (union_errors) {
      for (const branch of union_errors) {
        result.push(...collectAllIssues(branch.issues, full_path))
      }
    }
  }
  return result
}

function pickDeepestIssue(
  issues: ReadonlyArray<z.core.$ZodIssue>,
  resolved_target: unknown,
): { path: PropertyKey[]; issue: z.core.$ZodIssue } {
  const all = collectAllIssues(issues, [])
  let best = all[0]
  let best_depth = best.path.length
  let best_is_primitive = isPrimitive(getAtPath(resolved_target, best.path))
  for (const candidate of all) {
    const depth = candidate.path.length
    const value = getAtPath(resolved_target, candidate.path)
    const cand_is_primitive = isPrimitive(value)
    // Prefer deeper paths; at equal depth prefer ones landing on a primitive
    if (depth > best_depth || (depth === best_depth && cand_is_primitive && !best_is_primitive)) {
      best = candidate
      best_depth = depth
      best_is_primitive = cand_is_primitive
    }
  }
  return best
}

function isPrimitive(v: unknown): boolean {
  return v !== undefined && v !== null && typeof v !== 'object'
}

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
    const picked = pickDeepestIssue(second_pass.error.issues, first_pass)
    const offender = findOffender(parsed, picked.path)
    const formatted = formatSimpleNode(parsed, 2, offender).join('\n')
    const actual_value = getAtPath(first_pass, picked.path)
    throw new Error(
      `Error parsing\n${formatted}\n\nusing schema ${schema.description}\nsaw: ${
        humanReadableJson(actual_value === undefined ? '<undefined>' : actual_value).trimEnd()
      }`,
    )
  }

  // This will slow things down temporarily, but I want to ensure that these functions work when exercised by real s_expressions
  const normal_form_by_inverse = inverseSExpression(second_pass.data as AnyNode)
  const normalized = fastNormalForm(normal_form_by_inverse)
  assertEquals(normal_form_by_inverse, normalized, `${normal_form_by_inverse} ; ${normalized}`)
  return second_pass.data as z.infer<Schema>
}

function findRawSubtree(
  node: SExpressionSimpleNode,
  matches: (n: RawSimpleNode) => boolean,
): RawSimpleNode | null {
  if (!Array.isArray(node)) return null
  if (matches(node)) return node
  for (let i = 1; i < node.length; i++) {
    const child = node[i]
    if (Array.isArray(child)) {
      const found = findRawSubtree(child, matches)
      if (found) return found
    }
  }
  return null
}

export function formatExpressionWithErrorAt(
  expression: string,
  matches: (raw_node: RawSimpleNode) => boolean,
): string {
  const parsed = s_expression(expression) as SExpressionSimpleNode
  assert(!(parsed instanceof Error))
  assert(Array.isArray(parsed))
  const offender_node = findRawSubtree(parsed, matches)
  assert(offender_node, 'Could not locate matching subtree in expression')
  return formatSimpleNode(parsed, 2, { kind: 'atom', parent: offender_node }).join('\n')
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
  'kg/m²' as const,
  'mmol/L' as const,
  'mmHg' as const,
  'mm' as const,
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
    if (atom === 'time_ago' && index === 1) {
      return item
    }
    if (atom === 'active_condition' && index === 1) {
      assert(item === 'possible')
      return item
    }
    if (atom === 'role') {
      assert(isString(item))
      return item
    }
    if (isString(item)) return `"${item}"`
    throw new Error(`Unable to normalize ${item}`)
  }).join(' ')
  return `(${atom} ${terms})`
}
