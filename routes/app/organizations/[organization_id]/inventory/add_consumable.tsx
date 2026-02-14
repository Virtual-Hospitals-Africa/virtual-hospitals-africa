import { z } from 'zod'
import { LoggedInHealthWorkerContext } from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import OrganizationConsumableForm from '../../../../../islands/inventory/Consumable.tsx'
import { inventory } from '../../../../../db/models/inventory.ts'
import { assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import { todayISOInJohannesburg } from '../../../../../util/date.ts'
import consumables from '../../../../../db/models/consumables.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import roleByProfession from '../../../../../shared/roleByProfession.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'

const AddConsumableSchema = z.object({
  quantity: z.number(),
  consumable_id: z.string(),
  procured_from_name: z.string(),
  procured_from_id: z.string().optional(),
}).describe('Add consumable')

export const handler = postHandler(
  AddConsumableSchema,
  async (ctx: OrganizationContext, to_add) => {
    const admin_role = roleByProfession(
      ctx.state.organization_employment,
      'admin',
    )
    assertOr403(admin_role)

    const { organization_id } = ctx.params

    await inventory.procureConsumable(
      ctx.state.trx,
      organization_id,
      {
        created_by: admin_role.employment_id,
        procured_from_id: to_add.procured_from_id,
        procured_from_name: to_add.procured_from_name,
        consumable_id: to_add.consumable_id,
        quantity: to_add.quantity,

        //Todo: check the logic for non medicines consumables
        container_size: 1,
        number_of_containers: to_add.quantity,
      },
    )

    const success = encodeURIComponent(
      `Consumable added to your organization's inventory 🏥`,
    )

    return redirect(
      `/app/organizations/${organization_id}/inventory?active_tab=consumables&success=${success}`,
    )
  },
)

export default HealthWorkerHomePageLayout(
  'Add Consumable',
  async function ConsumableAdd(
    { url, state }: LoggedInHealthWorkerContext,
  ) {
    const consumable_id = url.searchParams.get(
      'consumable_id',
    )
    const consumable = consumable_id
      ? await consumables.getById(
        state.trx,
        consumable_id,
      )
      : null

    return (
      <OrganizationConsumableForm
        today={todayISOInJohannesburg()}
        consumable={consumable}
      />
    )
  },
)
