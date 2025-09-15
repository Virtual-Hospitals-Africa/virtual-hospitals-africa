import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

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
      ]),
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
      )
    }

    return qb
  },
})
