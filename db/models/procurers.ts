import { type RenderedProcurer, TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

export default base({
  top_level_table: 'procurers',
  baseQuery: (
    trx: TrxOrDb,
    opts: { search: string | null },
  ) =>
    trx
      .selectFrom('procurers')
      .select([
        'procurers.id',
        'procurers.name',
      ])
      .$if(!!opts.search, (qb) => qb.where('procurers.name', 'ilike', `%${opts.search}%`)),
  formatResult: (x): RenderedProcurer => x,
})
