import { Maybe, TrxOrDbOrQueryCreator } from '../../types.ts'
import { ExpressionBuilder, RawBuilder, sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { isAtom, parseWithSchema } from '../../shared/s_expression.ts'
import { any_query_single, AnyNode, Lang } from '../../shared/s_expression_schemas.ts'
import type { DB, SnomedCategory } from '../../db.d.ts'
import isKeyOf from '../../util/isKeyOf.ts'
import { activeConditionAsOr } from '../../shared/s_expression_active_condition_as_or.ts'

export function snomedConceptId(
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
  const parent_id = snomedConceptId(specific_snomed_concept)
  return sql<boolean>`EXISTS (
    SELECT 1 FROM snomed_concept_active_descendants_realized
    WHERE ancestor_id = ${parent_id}::bigint
    AND descendant_id = ${sql.ref(column_ref)}
  )`
}

/*
  Whether SNOMED itself defines the concept in column_ref as having the attribute,
  e.g. Difficulty talking has Interprets = Ability to speak without anyone recording it.
  The value matches when the defined value is the attribute's value or one of its descendants.
*/
function snomedDefinedAttributePredicate(
  column_ref: string,
  { specific_snomed_concept, value }: Lang['attribute'],
): RawBuilder<boolean> {
  // An event as a value is a patient fact, so no concept carries it on its own
  if (value.atom !== 'snomed_concept') {
    return sql<boolean>`false`
  }
  return sql<boolean>`EXISTS (
    SELECT 1
      FROM snomed_relationship
      JOIN snomed_concept_active_descendants_realized AS value_descendants
        ON value_descendants.descendant_id = snomed_relationship.destination_id
     WHERE snomed_relationship.active
       AND snomed_relationship.source_id = ${sql.ref(column_ref)}
       AND snomed_relationship.type_id = ${snomedConceptId(specific_snomed_concept)}::bigint
       AND value_descendants.ancestor_id = ${snomedConceptId(value)}::bigint
  )`
}

type PredicateAtom =
  | 'finding'
  | 'procedure'
  | 'evaluation'
  | 'measurement'
  | 'active_condition'

const PREDICATE_BUILDERS = {
  finding(column_ref, { root_snomed_concept, specific_snomed_concept, qualifiers, attributes, excluding }) {
    // Qualifiers are recorded against a patient's record, so no concept satisfies one on its own
    if (qualifiers.length) {
      return sql<boolean>`false`
    }
    const predicates = [
      // A finding written with a single concept parses it as the root, so fall back to it
      basePredicate(column_ref, { specific_snomed_concept: specific_snomed_concept ?? root_snomed_concept }),
      ...attributes.map((attribute) => snomedDefinedAttributePredicate(column_ref, attribute)),
      ...excluding.map((excl) => sql<boolean>`NOT (${internalBuildExpressionPredicate(column_ref, excl.finding)})`),
    ]
    return sql<boolean>`(${sql.join(predicates, sql` AND `)})`
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
  active_condition(column_ref, active_condition) {
    return internalBuildExpressionPredicate(column_ref, activeConditionAsOr(active_condition))
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
  const node = typeof s_expression === 'string' ? parseWithSchema(s_expression, any_query_single) : s_expression

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

export type MatchingSnomedConcept = {
  id: string
  name: string
  category: SnomedCategory
}

export function searchSnomedConceptsMatching(
  trx: TrxOrDbOrQueryCreator,
  s_expression: AnyNode | string,
): Promise<MatchingSnomedConcept[]> {
  return trx
    .selectFrom('snomed_inferred_canonical_name_and_category')
    .where((eb) => buildExpressionPredicate(eb, 'snomed_inferred_canonical_name_and_category.id', s_expression))
    .select(['id', 'name', 'category'])
    .orderBy('category')
    .orderBy('name')
    .execute()
}
