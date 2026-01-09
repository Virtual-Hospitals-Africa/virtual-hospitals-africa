import { LoggedInHealthWorkerContext } from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import OrganizationConsumableForm from '../../../../../islands/inventory/Consumable.tsx'
import { parseRequestAsserts } from '../../../../../backend/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'

import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { todayISOInJohannesburg } from '../../../../../util/date.ts'
import consumables from '../../../../../db/models/consumables.ts'
import isNumber from '../../../../../util/isNumber.ts'
import isString from '../../../../../util/isString.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import roleByProfession from '../../../../../shared/roleByProfession.ts'

export function assertIsUpsertConsumer(obj: unknown): asserts obj is {
  quantity: number
  consumable_id: string
  procured_from_name: string
  procured_from_id?: string
} {
  assertOr400(isObjectLike(obj))
  assertOr400(isNumber(obj.quantity))
  assertOr400(
    isNumber(obj.procured_from_id) || isString(obj.procured_from_name),
  )
  assertOr400(isNumber(obj.consumable_id))
}

export const handler = {
  async POST(ctx: OrganizationContext) {
    const req = ctx.req
    const admin_role = roleByProfession(
      ctx.state.organization_employment,
      'admin',
    )
    assertOr403(admin_role)

    const { organization_id } = ctx.params

    const to_add = await parseRequestAsserts(
      req,
      assertIsUpsertConsumer,
    )

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
}

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
