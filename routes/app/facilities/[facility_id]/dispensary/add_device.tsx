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
import FacilityDeviceForm from '../../../../../islands/dispensary/inventory/Device.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as facility_rooms from '../../../../../db/models/facility_rooms.ts'

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
      facility_rooms.assertIsUpsert,
    )

    await facility_rooms.addFacilityDevice(ctx.state.trx, facility_id, to_add)

    return redirect(
      `/app/facilities/${facility_id}/dispensary`,
    )
  },
}

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
      avatarUrl={state.healthWorker.avatar_url}
      variant='home page'
    >
      <Container size='md'>
        <FacilityDeviceForm />
      </Container>
    </Layout>
  )
}
