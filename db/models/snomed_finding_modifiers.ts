import type { FindingRelatedModifiers, TrxOrDbOrQueryCreator } from '../../types.ts'
import type { Lang } from '../../shared/s_expression_schemas.ts'
import { snomed_predefined_attributes } from './snomed_predefined_attributes.ts'
import { snomed_relevant_qualifiers } from './snomed_relevant_qualifiers.ts'
import { snomed_onset_required } from './snomed_onset_required.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { pMap } from '../../util/inParallel.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'

/*
  The modifiers the finding modal offers for each finding, looked up by its specific concept
  the same way the warning signs search does for its results. Keyed by the s_expression the
  nodes were keyed by.
  TODO: batch?
*/
export async function modifiersOf(
  trx: TrxOrDbOrQueryCreator,
  nodes: Map<string, Lang['finding']>,
): Promise<Map<string, FindingRelatedModifiers>> {
  const entries = await pMap([...nodes.entries()], async ([s_expression, node]): Promise<[string, FindingRelatedModifiers]> => {
    assertHasProperty(node, 'specific_snomed_concept')
    const snomed_concept = node.specific_snomed_concept
    const row = await trx.selectNoFrom((eb) => [
      jsonArrayFrom(snomed_predefined_attributes.baseQuery(trx, { snomed_concept })).as('predefined_attributes'),
      jsonArrayFrom(snomed_relevant_qualifiers.baseQuery(trx, { snomed_concept })).as('relevant_qualifiers'),
      eb.exists(snomed_onset_required.baseQuery(trx, { snomed_concept })).$castTo<boolean>().as('onset_required'),
    ]).executeTakeFirstOrThrow()
    return [s_expression, row]
  })
  return new Map(entries)
}
