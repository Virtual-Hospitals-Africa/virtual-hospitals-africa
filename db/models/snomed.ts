import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('snomed_inferred_canonical_name_and_category')
    .selectAll('snomed_inferred_canonical_name_and_category')
}
type SearchTerms = {
  search: string | null
}

export const snomed_model = base({
  verbose: true,
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery,
  formatResult(result) {
    return result
  },
  handleSearch(qb, opts: SearchTerms) {
    console.log('in here')
    if (opts.search) {
      qb = qb.where('snomed_inferred_canonical_name_and_category.name', 'ilike', `%${opts.search}%`)
    }
    return qb
  },
})
