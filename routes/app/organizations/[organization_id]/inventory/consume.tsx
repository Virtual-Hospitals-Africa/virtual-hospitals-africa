import { z } from 'zod'
import redirect from '../../../../../util/redirect.ts'
import { inventory } from '../../../../../db/models/inventory.ts'
import { assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import ConsumeForm from '../../../../../islands/inventory/ConsumeForm.tsx'
import { HealthWorkerHomePage } from '../../../_middleware.tsx'
import roleByProfession from '../../../../../shared/roleByProfession.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'

const ConsumeSchema = z.object({
  quantity: z.number(),
  procurement_id: z.string(),
  consumable_id: z.string(),
}).describe('Consume consumable')

export const handler = postHandler(
  ConsumeSchema,
  async (ctx: OrganizationContext, to_add) => {
    const admin_role = roleByProfession(
      ctx.state.organization_employment,
      'admin',
    )
    assertOr403(admin_role)

    const active_tab = ctx.url.searchParams.get('active_tab')!

    const organization_id = ctx.state.organization.id

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
)

export default HealthWorkerHomePage(
  'Consumption Test',
  ConsumeForm,
)
