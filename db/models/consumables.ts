import { type RenderedConsumable, TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

export default base({
  top_level_table: 'consumables',
  baseQuery: (
    trx: TrxOrDb,
  ) =>
    trx
      .selectFrom('consumables')
      .where(
        'id',
        'not in',
        trx.selectFrom('manufactured_medication_strengths')
          .select('consumable_id')
          .distinct(),
      )
      .select([
        'consumables.id',
        'consumables.name',
      ]),
  formatResult: (x): RenderedConsumable => x,
  handleSearch(
    qb,
    opts: { search: string | null },
  ) {
    if (opts.search) {
      qb = qb.where('consumables.name', 'ilike', `%${opts.search}%`)
    }

    return qb
  },
})
