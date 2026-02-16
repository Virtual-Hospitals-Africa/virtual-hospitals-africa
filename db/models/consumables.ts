import { Maybe, type RenderedConsumable, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'

export default base({
  top_level_table: 'consumables',
  baseQuery: (
    trx: TrxOrDbOrQueryCreator,
    opts: { search?: Maybe<string> },
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
  formatResult: identity<RenderedConsumable>,
})
