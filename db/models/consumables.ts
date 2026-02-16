import { type RenderedConsumable, TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

export default base({
  top_level_table: 'consumables',
  baseQuery: (
    trx: TrxOrDb,
    opts: { search: string | null },
  ) =>
    trx
      .selectFrom('consumables')
      .where(
        'id',
        'not in',
        trx.selectFrom('medication_doses')
          .select('id')
          .distinct(),
      )
      .select([
        'consumables.id',
        'consumables.name',
      ])
      .$if(!!opts.search, (qb) => qb.where('consumables.name', 'ilike', `%${opts.search}%`)),
  formatResult: (x): RenderedConsumable => x,
})
