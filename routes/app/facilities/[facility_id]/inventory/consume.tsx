import { assert } from 'std/assert/assert.ts'
import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  FacilityConsumable,
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { FacilityContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import ConsumeForm from '../../../../../islands/inventory/ConsumeForm.tsx'

export function assertIsUpsert(obj: unknown): asserts obj {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.quantity === 'number')
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  FacilityContext['state']
> = {
  async POST(req, ctx) {
    const { admin } = ctx.state.facility_employment.roles
    assertOr403(admin)
    const procurement_id = parseInt(ctx.url.searchParams.get('procurement_id')!)
    const consumable_id = parseInt(ctx.url.searchParams.get('consumable_id')!)
    const active_tab = ctx.url.searchParams.get('active_tab')!

    const facility_id = getRequiredNumericParam(ctx, 'facility_id')

    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsert,
    )

    await inventory.consumeFacilityConsumable(
      ctx.state.trx,
      {
        created_by: admin.employment_id,
        facility_id: facility_id,
        procurement_id: procurement_id,
        consumable_id: consumable_id,
        quantity: to_add.quantity,
      } as FacilityConsumable,
    )

    const success = encodeURIComponent(
      `Item consumed!`,
    )

    return redirect(
      `/app/facilities/${facility_id}/inventory/history?consumable_id=${consumable_id}&active_tab=${active_tab}&success=${success}`,
    )
  },
}

// deno-lint-ignore require-await
export default async function Consume(
  _req: Request,
  { route, url, state }: FreshContext<LoggedInHealthWorker>,
) {
  return (
    <Layout
      variant='home page'
      title='Consumption Test'
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <Container size='md'>
        <ConsumeForm />
      </Container>
    </Layout>
  )
}
