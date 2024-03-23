import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import FacilityConsumableForm from '../../../../../islands/inventory/Consumable.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { FacilityContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { todayISOInHarare } from '../../../../../util/date.ts'

export function assertIsUpsertConsumer(obj: unknown): asserts obj is {
  quantity: number
  consumable_id: number
  procured_by_name: string
  procured_by_id?: number
} {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.quantity === 'number')
  assertOr400(typeof obj.procured_by_id === 'number')
  assertOr400(typeof obj.consumable_id === 'number')
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  FacilityContext['state']
> = {
  async POST(req, ctx) {
    const { admin } = ctx.state.facility_employment.roles
    assertOr403(admin)

    const facility_id = getRequiredNumericParam(ctx, 'facility_id')

    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertConsumer,
    )

    await inventory.procureConsumable(
      ctx.state.trx,
      facility_id,
      {
        created_by: admin.employment_id,
        procured_by_id: to_add.procured_by_id,
        procured_by_name: to_add.procured_by_name,
        consumable_id: to_add.consumable_id,
        quantity: to_add.quantity,
      },
    )

    const success = encodeURIComponent(
      `Consumable added to your facility's inventory 🏥`,
    )

    return redirect(
      `/app/facilities/${facility_id}/inventory?active_tab=consumables&success=${success}`,
    )
  },
}

// deno-lint-ignore require-await
export default async function ConsumableAdd(
  _req: Request,
  { route, url, state }: FreshContext<LoggedInHealthWorker>,
) {
  return (
    <Layout
      variant='home page'
      title='Add Consumable'
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <Container size='md'>
        <FacilityConsumableForm today={todayISOInHarare()} />
      </Container>
    </Layout>
  )
}
