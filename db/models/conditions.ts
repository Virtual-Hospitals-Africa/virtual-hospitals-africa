import type { SelectQueryBuilder } from 'kysely/index.d.ts'
import { Condition, TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'
import type { DB } from '../../db.d.ts'

function baseQuery(
  trx: TrxOrDb,
): SelectQueryBuilder<DB, 'conditions', Condition> {
  return trx
    .selectFrom('conditions')
    .selectAll()
}

export default base({
  top_level_table: 'conditions',
  baseQuery,
  formatResult: (x: Condition): Condition => x,
  handleSearch(
    qb,
    opts: { search: string | null; is_procedure: boolean },
  ) {
    if (opts.search) {
      qb = qb.where('name', 'ilike', `%${opts.search}%`)
    }

    return qb.where('is_procedure', '=', opts.is_procedure)
  },
})
