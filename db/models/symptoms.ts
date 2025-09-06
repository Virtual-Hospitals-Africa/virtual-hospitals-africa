import { DB } from '../../db.d.ts'
import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

// TODO actually get more refined results
// Also, not sure why I'm having to feed all these types into base
export default base<
  { search?: string },
  DB,
  'snomed_inferred_canonical_name_and_category',
  'snomed_inferred_canonical_name_and_category',
  { id: string; name: string },
  { id: string; name: string },
  Record<string, unknown>
>({
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery(trx: TrxOrDb) {
    return trx
      .selectFrom('snomed_inferred_canonical_name_and_category')
      .select([
        'snomed_inferred_canonical_name_and_category.id',
        'snomed_inferred_canonical_name_and_category.name',
      ])
      .where(
        'snomed_inferred_canonical_name_and_category.category',
        '=',
        'finding',
      )
  },
  formatResult(
    result: { id: string; name: string },
  ): { id: string; name: string } {
    return result
  },
  handleSearch(qb, opts: { search?: string }) {
    if (opts.search) {
      qb = qb.where('name', 'ilike', `%${opts.search}%`)
    }
    return qb
  },
})
