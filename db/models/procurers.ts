import { type RenderedProcurer, TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

export default base({
  top_level_table: 'procurers',
  baseQuery: (
    trx: TrxOrDb,
  ) =>
    trx
      .selectFrom('procurers')
      .select([
        'procurers.id',
        'procurers.name',
      ]),
  formatResult: (x): RenderedProcurer => x,
  handleSearch(
    qb,
    opts: { search: string | null },
  ) {
    if (opts.search) {
      qb = qb.where('procurers.name', 'ilike', `%${opts.search}%`)
    }

    return qb
  },
})
