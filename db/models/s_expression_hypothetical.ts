import type { TrxOrDbOrQueryCreator } from '../../types.ts'
import type { InsertableFindingBase, Lang } from '../../shared/s_expression_schemas.ts'
import { nameAndCategorySnomedConceptBase } from './s_expression.ts'

/*
  Decides whether a finding that has NOT been inserted yet would satisfy a query
  s_expression. This mirrors, clause for clause, the SQL that baseQuery in
  db/models/s_expression.ts generates when matching an inserted record, but
  evaluates it against the in-memory node instead of patient_records. The
  database is consulted only for SNOMED hierarchy facts (descendants and
  defining relationships), never for patient data.

  test/models/findings_to_check_for.test.ts has a parity test that runs the real
  insert pipeline alongside this matcher for every warning sign and common
  symptom, so semantic drift between the two shows up there.
*/

type SnomedConceptNode = Lang['snomed_concept']

function sameConcept(a: SnomedConceptNode, b: SnomedConceptNode): boolean {
  return a.name === b.name && a.category === b.category
}

export async function isDescendantOrSelf(
  trx: TrxOrDbOrQueryCreator,
  { ancestor, descendant }: { ancestor: SnomedConceptNode; descendant: SnomedConceptNode },
): Promise<boolean> {
  if (sameConcept(ancestor, descendant)) return true
  const row = await trx.selectFrom('snomed_concept_active_descendants_realized')
    .where('ancestor_id', 'in', nameAndCategorySnomedConceptBase(trx, ancestor))
    .where('descendant_id', 'in', nameAndCategorySnomedConceptBase(trx, descendant))
    .select('descendant_id')
    .limit(1)
    .executeTakeFirst()
  return !!row
}

// Whether SNOMED itself defines `source` as having `attribute_type` = (a descendant of) `value`,
// e.g. Epistaxis has Finding site = Nasal structure without anyone recording it.
export async function hasInferredAttribute(
  trx: TrxOrDbOrQueryCreator,
  { source, attribute_type, value }: { source: SnomedConceptNode; attribute_type: SnomedConceptNode; value: SnomedConceptNode },
): Promise<boolean> {
  const row = await trx.selectFrom('snomed_relationship')
    .innerJoin(
      'snomed_concept_active_descendants_realized as dest_descendants',
      'dest_descendants.descendant_id',
      'snomed_relationship.destination_id',
    )
    .where('snomed_relationship.active', '=', true)
    .where('snomed_relationship.type_id', 'in', nameAndCategorySnomedConceptBase(trx, attribute_type))
    .where('snomed_relationship.source_id', 'in', nameAndCategorySnomedConceptBase(trx, source))
    .where('dest_descendants.ancestor_id', 'in', nameAndCategorySnomedConceptBase(trx, value))
    .select('snomed_relationship.source_id')
    .limit(1)
    .executeTakeFirst()
  return !!row
}

async function every<T>(items: T[], predicate: (item: T) => Promise<boolean>): Promise<boolean> {
  for (const item of items) {
    if (!(await predicate(item))) return false
  }
  return true
}

async function some<T>(items: T[], predicate: (item: T) => Promise<boolean>): Promise<boolean> {
  for (const item of items) {
    if (await predicate(item)) return true
  }
  return false
}

// EXPRESSION_BUILDERS.qualifier: a qualifier record whose concept is the required
// concept or a descendant of it, itself carrying every nested qualifier required.
function qualifierSatisfied(
  trx: TrxOrDbOrQueryCreator,
  record_qualifiers: Lang['qualifier'][],
  required: Lang['qualifier'],
): Promise<boolean> {
  return some(record_qualifiers, async (record_qualifier) => {
    const concept_matches = await isDescendantOrSelf(trx, {
      ancestor: required.specific_snomed_concept,
      descendant: record_qualifier.specific_snomed_concept,
    })
    if (!concept_matches) return false
    return every(required.qualifiers, (nested) => qualifierSatisfied(trx, record_qualifier.qualifiers, nested))
  })
}

function sameDatetime(a: string, b: string): boolean {
  return new Date(a).getTime() === new Date(b).getTime()
}

// EXPRESSION_BUILDERS.attribute, plus the snomed_relationship inference fallback that
// baseQuery applies for concept-valued attributes.
async function attributeSatisfied(
  trx: TrxOrDbOrQueryCreator,
  record: InsertableFindingBase,
  required: Lang['attribute'],
): Promise<boolean> {
  const explicitly_recorded = await some(record.attributes, async (attribute) => {
    if (!sameConcept(attribute.root_snomed_concept, required.root_snomed_concept)) return false
    const specific_matches = await isDescendantOrSelf(trx, {
      ancestor: required.specific_snomed_concept,
      descendant: attribute.specific_snomed_concept,
    })
    if (!specific_matches) return false

    if (required.value.atom === 'event') {
      if (attribute.value.atom !== 'event') return false
      return !required.value.datetime || sameDatetime(attribute.value.datetime, required.value.datetime)
    }
    if (attribute.value.atom !== 'snomed_concept') return false
    return isDescendantOrSelf(trx, { ancestor: required.value, descendant: attribute.value })
  })
  if (explicitly_recorded) return true
  if (required.value.atom === 'event') return false

  return hasInferredAttribute(trx, {
    source: record.specific_snomed_concept,
    attribute_type: required.specific_snomed_concept,
    value: required.value,
  })
}

export async function hypotheticalFindingSatisfies(
  trx: TrxOrDbOrQueryCreator,
  record: InsertableFindingBase,
  query: Lang['finding'],
): Promise<boolean> {
  if (query.root_snomed_concept && !sameConcept(record.root_snomed_concept, query.root_snomed_concept)) {
    return false
  }

  if (query.specific_snomed_concept && !sameConcept(record.specific_snomed_concept, query.specific_snomed_concept)) {
    // A descendant only matches a non-exact query, and only for positive findings, so that
    // a "No" for a specific concept is not read as a "No" for the whole parent concept
    if (query.exact || record.existence !== 'Yes') return false
    const descends = await isDescendantOrSelf(trx, { ancestor: query.specific_snomed_concept, descendant: record.specific_snomed_concept })
    if (!descends) return false
  }

  if (query.value_snomed_concept) {
    if (!record.value_snomed_concept) return false
    const value_matches = query.exact
      ? sameConcept(record.value_snomed_concept, query.value_snomed_concept)
      : await isDescendantOrSelf(trx, { ancestor: query.value_snomed_concept, descendant: record.value_snomed_concept })
    if (!value_matches) return false
  }

  if (query.existence !== 'Any' && query.existence !== record.existence) return false

  if (!(await every(query.qualifiers, (qualifier) => qualifierSatisfied(trx, record.qualifiers, qualifier)))) return false

  if (!(await every(query.attributes, (attribute) => attributeSatisfied(trx, record, attribute)))) return false

  // NOT IN (excluded finding): the record must not itself satisfy any excluded expression.
  // A plain finding can never satisfy a measurement expression.
  return every(query.excluding, async (excluding) => {
    if (excluding.finding.atom === 'measurement') return true
    return !(await hypotheticalFindingSatisfies(trx, record, excluding.finding))
  })
}
