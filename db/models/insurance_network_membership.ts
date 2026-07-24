import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base } from './_base.ts'

type InsuranceNetworkMembershipSearch = {
  health_worker_id?: string
  insurance_network_id?: string
  is_active?: boolean
}

function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  opts: InsuranceNetworkMembershipSearch = {},
) {
  return trx
    .selectFrom('insurance_network_membership')
    .selectAll()
    .$if(!!opts.health_worker_id, (qb) =>
      qb.where('health_worker_id', '=', opts.health_worker_id!)
    )
    .$if(!!opts.insurance_network_id, (qb) =>
      qb.where('insurance_network_id', '=', opts.insurance_network_id!)
    )
    .$if(opts.is_active !== undefined, (qb) =>
      qb.where('is_active', '=', opts.is_active!)
    )
}

export const insurance_network_membership = base({
  top_level_table: 'insurance_network_membership',
  baseQuery,
  formatResult: (row) => row,
})
