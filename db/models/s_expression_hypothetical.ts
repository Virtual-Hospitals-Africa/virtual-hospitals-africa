import type { TrxOrDbOrQueryCreator } from '../../types.ts'
import type { Lang } from '../../shared/s_expression_schemas.ts'
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
