import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  Maybe,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import FacilityDeviceForm from '../../../../../islands/inventory/Device.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  {
    facility: { id: number; name: string }
  }
> = {
  async POST(req, ctx) {
    const facility_id = parseInt(ctx.params.facility_id)
    assert(facility_id)

    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      inventory.assertIsUpsert,
    )

    await inventory.addFacilityDevice(ctx.state.trx, facility_id, to_add)

    return redirect(
      `/app/facilities/${facility_id}/inventory`,
    )
  },
}

// deno-lint-ignore require-await
export default async function DeviceAdd(
  _req: Request,
  { url, state, params, route }: FreshContext<LoggedInHealthWorker>,
) {
  const facility_id = parseInt(params.facility_id)
  assert(facility_id)

  return (
    <Layout
      title={'Add Device'}
      route={route}
      url={url}
      health_worker={state.healthWorker}
      variant='home page'
    >
      <Container size='md'>
        <FacilityDeviceForm />
      </Container>
    </Layout>
  )
}
