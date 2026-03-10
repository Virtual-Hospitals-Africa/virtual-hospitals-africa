import { Maybe } from '../../types.ts'
import { ExpressionBuilder, RawBuilder, sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { isAtom, parseExpressionExpectingAtom, parseWithSchema } from '../../shared/s_expression.ts'
import { any_query, AnyNode, Lang } from '../../shared/s_expression_schemas.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { STATUS_ATTRIBUTE, YES_QUALIFIER } from '../../shared/snomed_concepts.ts'
import type { DB } from '../../db.d.ts'
import isKeyOf from '../../util/isKeyOf.ts'

function snomedConceptIdPredicate(
  snomed_concept: Lang['snomed_concept'],
): string | RawBuilder<string> {
  assert(isAtom(snomed_concept, 'snomed_concept'))
  return sql<string>`(
    SELECT id FROM snomed_inferred_canonical_name_and_category
    WHERE name = ${snomed_concept.name} AND category = ${snomed_concept.category}
  )`
}

function basePredicate(
  column_ref: string,
  { specific_snomed_concept }: {
    specific_snomed_concept?: Maybe<Lang['snomed_concept']>
  } = {},
): RawBuilder<boolean> {
  if (!specific_snomed_concept) {
    return sql<boolean>`true`
  }
  const parent_id = snomedConceptIdPredicate(specific_snomed_concept)
  return sql<boolean>`is_descendant(${sql.ref(column_ref)}, ${parent_id}::bigint)`
}

type PredicateAtom =
  | 'finding'
  | 'procedure'
  | 'evaluation'
  | 'measurement'
  | 'not'
  | 'or'
  | 'and'
  | 'active_condition'

const PREDICATE_BUILDERS = {
  finding(column_ref, { specific_snomed_concept, qualifiers, attributes }) {
    // If qualifiers or attributes are specified, we can't evaluate them at the concept level
    // (they require patient record context), so this predicate never matches
    if (qualifiers?.length || attributes?.length) {
      return sql<boolean>`false`
    }
    return basePredicate(column_ref, { specific_snomed_concept })
  },
  procedure(column_ref, { specific_snomed_concept }) {
    return basePredicate(column_ref, { specific_snomed_concept })
  },
  evaluation(column_ref, { specific_snomed_concept }) {
    return basePredicate(column_ref, { specific_snomed_concept })
  },
  measurement(column_ref, { snomed_concept }) {
    return basePredicate(column_ref, {
      specific_snomed_concept: snomed_concept,
    })
  },
  not(column_ref, { expression }) {
    const inner_predicate = internalBuildExpressionPredicate(
      column_ref,
      expression,
    )
    return sql<boolean>`NOT (${inner_predicate})`
  },
  or(column_ref, { expressions }) {
    if (expressions.length === 0) return sql<boolean>`false`
    const predicates = expressions.map((expr) => internalBuildExpressionPredicate(column_ref, expr))
    return sql<boolean>`(${sql.join(predicates, sql` OR `)})`
  },
  and(column_ref, { expressions }) {
    if (expressions.length === 0) return sql<boolean>`true`
    const predicates = expressions.map((expr) => internalBuildExpressionPredicate(column_ref, expr))
    return sql<boolean>`(${sql.join(predicates, sql` AND `)})`
  },
  active_condition(column_ref, { snomed_concept, possible }) {
    const snomed_concept_s_expression = inverseSExpression(snomed_concept)
    const disjuncts = [
      `(clinical_finding ${snomed_concept_s_expression})`,
      `(finding ${STATUS_ATTRIBUTE.s_expression} ${snomed_concept_s_expression} ${YES_QUALIFIER.s_expression})`,
      `(diagnosis ${snomed_concept_s_expression} probable)`,
      `(diagnosis ${snomed_concept_s_expression} definite)`,
    ]
    if (possible) {
      disjuncts.push(
        `(diagnosis ${snomed_concept_s_expression} equivocal)`,
        `(diagnosis ${snomed_concept_s_expression} possible)`
      )
    }
    const or_expression = `(or ${disjuncts.join(' ')})`
    console.log({or_expression})
    const expanded_expression = parseExpressionExpectingAtom(
      or_expression,
      'or',
    )
    return internalBuildExpressionPredicate(column_ref, expanded_expression)
  },
} satisfies {
  [T in PredicateAtom]: (
    column_ref: string,
    node: AnyNode & { atom: T },
  ) => RawBuilder<boolean>
}

function internalBuildExpressionPredicate(
  column_ref: string,
  s_expression: AnyNode | string,
): RawBuilder<boolean> {
  const node = typeof s_expression === 'string' ? parseWithSchema(s_expression, any_query) : s_expression

  if (!isKeyOf(node.atom, PREDICATE_BUILDERS)) {
    throw new Error(`${node.atom} is not supported as a predicate`)
  }
  // deno-lint-ignore ban-types
  const builder = PREDICATE_BUILDERS[node.atom] as Function
  return builder(column_ref, node) as RawBuilder<boolean>
}

// deno-lint-ignore no-explicit-any
export function buildExpressionPredicate<EB extends ExpressionBuilder<DB, any>>(
  _eb: EB, // Useful even if unused to confirm that the column_ref is legit
  column_ref: Parameters<EB['ref']>[0],
  node: AnyNode | string,
): RawBuilder<boolean> {
  return internalBuildExpressionPredicate(column_ref, node)
}
