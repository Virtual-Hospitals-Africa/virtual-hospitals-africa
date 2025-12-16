import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

const FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT_SNOMED_CONCEPT_ID = '57177007' // |Family history with explicit context (situation)|

export default base({
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery: (
    trx: TrxOrDb,
  ) =>
    trx
      .selectFrom('snomed_inferred_canonical_name_and_category')
      .innerJoin(
        'snomed_family_history',
        'snomed_family_history.id',
        'snomed_inferred_canonical_name_and_category.id',
      )
      .select([
        'snomed_inferred_canonical_name_and_category.id',
        'snomed_inferred_canonical_name_and_category.name',
      ])
      .where((eb) =>
        sql<boolean>`is_descendant(${
          eb.ref('snomed_inferred_canonical_name_and_category.id')
        }, ${FAMILY_HISTORY_WITH_EXPLICIT_CONTEXT_SNOMED_CONCEPT_ID}::bigint)`
      ),
  formatResult: (x) => x,
  handleSearch(
    qb,
    opts: { search?: string },
  ) {
    if (opts.search) {
      qb = qb.where(
        'snomed_inferred_canonical_name_and_category.name',
        'ilike',
        `%${opts.search}%`,
      ).orderBy('snomed_inferred_canonical_name_and_category.name', 'asc')
    }

    return qb
  },
})
