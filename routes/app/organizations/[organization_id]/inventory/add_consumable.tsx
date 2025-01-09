import { FreshContext } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import OrganizationConsumableForm from '../../../../../islands/inventory/Consumable.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'

import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { todayISOInHarare } from '../../../../../util/date.ts'
import consumables from '../../../../../db/models/consumables.ts'
import isNumber from '../../../../../util/isNumber.ts'
import isString from '../../../../../util/isString.ts'

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

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  OrganizationContext['state']
> = {
  async POST(req, ctx) {
    const { admin } = ctx.state.organization_employment.roles
    assertOr403(admin)

    const { organization_id } = ctx.params

    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertConsumer,
    )

    await inventory.procureConsumable(
      ctx.state.trx,
      organization_id,
      {
        created_by: admin.employment_id,
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

export default async function ConsumableAdd(
  _req: Request,
  { route, url, state }: FreshContext<LoggedInHealthWorker>,
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
    <Layout
      variant='health worker home page'
      title='Add Consumable'
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <OrganizationConsumableForm
        today={todayISOInHarare()}
        consumable={consumable}
      />
    </Layout>
  )
}
