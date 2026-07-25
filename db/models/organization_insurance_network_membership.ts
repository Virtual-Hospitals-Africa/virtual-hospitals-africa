import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base } from './_base.ts'

type OrganizationInsuranceNetworkMembershipSearch = {
  organization_id?: string
  insurance_network_id?: string
}

function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  opts: OrganizationInsuranceNetworkMembershipSearch = {},
) {
  return trx
    .selectFrom('organization_insurance_network_membership')
    .selectAll()
    .$if(!!opts.organization_id, (qb) =>
      qb.where('organization_id', '=', opts.organization_id!)
    )
    .$if(!!opts.insurance_network_id, (qb) =>
      qb.where('insurance_network_id', '=', opts.insurance_network_id!)
    )
}

export const organization_insurance_network_membership = base({
  top_level_table: 'organization_insurance_network_membership',
  baseQuery,
  formatResult: (row) => row,
})
