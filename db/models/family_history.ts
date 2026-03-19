import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base } from './_base.ts'
import { FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT } from '../../shared/snomed_concepts.ts'

export default base({
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery: (
    trx: TrxOrDbOrQueryCreator,
    opts: { search?: string },
  ) =>
    trx
      .selectFrom('snomed_inferred_canonical_name_and_category')
      .innerJoin(
        'snomed_concept_active_descendants_realized',
        (join) =>
          join
            .onRef('snomed_concept_active_descendants_realized.descendant_id', '=', 'snomed_inferred_canonical_name_and_category.id')
            .on('snomed_concept_active_descendants_realized.ancestor_id', '=', FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT.id),
      )
      .select([
        'snomed_inferred_canonical_name_and_category.id',
        'snomed_inferred_canonical_name_and_category.name',
      ])
      .$if(!!opts.search, (qb) =>
        qb.where('snomed_inferred_canonical_name_and_category.name', 'ilike', `%${opts.search}%`).orderBy(
          'snomed_inferred_canonical_name_and_category.name',
          'asc',
        )),
  formatResult: (x) => x,
})
