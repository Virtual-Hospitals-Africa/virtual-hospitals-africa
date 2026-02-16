import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

export default base({
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery: (
    trx: TrxOrDb,
    opts: { search?: string },
  ) =>
    trx
      .selectFrom('snomed_inferred_canonical_name_and_category')
      .select([
        'snomed_inferred_canonical_name_and_category.id',
        'snomed_inferred_canonical_name_and_category.name',
      ]).where(
        'snomed_inferred_canonical_name_and_category.category',
        '=',
        'finding',
      )
      .$if(!!opts.search, (qb) => qb.where('snomed_inferred_canonical_name_and_category.name', 'ilike', `%${opts.search}%`)),
  formatResult: (x) => x,
})
