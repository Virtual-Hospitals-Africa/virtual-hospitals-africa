import { sql } from 'kysely'
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
      .select([
        'snomed_inferred_canonical_name_and_category.id',
        'snomed_inferred_canonical_name_and_category.name',
      ])
      .where((eb) =>
        sql<boolean>`is_descendant(${eb.ref('snomed_inferred_canonical_name_and_category.id')}, ${FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT.id}::bigint)`
      )
      .$if(!!opts.search, (qb) =>
        qb.where('snomed_inferred_canonical_name_and_category.name', 'ilike', `%${opts.search}%`).orderBy(
          'snomed_inferred_canonical_name_and_category.name',
          'asc',
        )),
  formatResult: (x) => x,
})
