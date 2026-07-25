import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base } from './_base.ts'

type InsuranceNetworkSearch = {
  country?: string
}

function baseQuery(trx: TrxOrDbOrQueryCreator, opts: InsuranceNetworkSearch = {}) {
  return trx
    .selectFrom('insurance_network')
    .selectAll()
    .$if(!!opts.country, (qb) => qb.where('country', '=', opts.country!))
}

export const insurance_network = base({
  top_level_table: 'insurance_network',
  baseQuery,
  formatResult: (row) => row,
})
