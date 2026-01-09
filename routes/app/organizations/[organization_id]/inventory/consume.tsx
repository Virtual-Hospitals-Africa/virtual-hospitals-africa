import redirect from '../../../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import ConsumeForm from '../../../../../islands/inventory/ConsumeForm.tsx'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import roleByProfession from '../../../../../shared/roleByProfession.ts'

export function assertIsUpsert(obj: unknown): asserts obj is {
  quantity: number
  procurement_id: string
  consumable_id: string
} {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.quantity === 'number')
  assertOr400(typeof obj.procurement_id === 'string')
  assertOr400(typeof obj.consumable_id === 'string')
}

export const handler = {
  async POST(ctx: OrganizationContext) {
    const req = ctx.req
    const admin_role = roleByProfession(
      ctx.state.organization_employment,
      'admin',
    )
    assertOr403(admin_role)

    const active_tab = ctx.url.searchParams.get('active_tab')!

    const organization_id = ctx.state.organization.id

    const to_add = await parseRequestAsserts(
      req,
      assertIsUpsert,
    )

    await inventory.consumeConsumable(
      ctx.state.trx,
      organization_id,
      {
        created_by: admin_role.employment_id,
        procurement_id: to_add.procurement_id,
        consumable_id: to_add.consumable_id,
        quantity: to_add.quantity,
      },
    )

    const success = encodeURIComponent(
      `Item consumed!`,
    )

    return redirect(
      `/app/organizations/${organization_id}/inventory/history?consumable_id=${to_add.consumable_id}&active_tab=${active_tab}&success=${success}`,
    )
  },
}

export default HealthWorkerHomePageLayout(
  'Consumption Test',
  ConsumeForm,
)
