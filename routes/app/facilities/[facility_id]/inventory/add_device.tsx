import { FreshContext } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  RenderedDevice,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import FacilityDeviceForm from '../../../../../islands/inventory/Device.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import * as devices from '../../../../../db/models/devices.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import {
  assertOr400,
  assertOr403,
  assertOr404,
} from '../../../../../util/assertOr.ts'
import { FacilityContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'

export function assertIsUpsertDevice(
  obj: unknown,
): asserts obj is { device_id: number; serial_number?: string } {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.device_id === 'number')
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
      assertIsUpsertDevice,
    )

    await inventory.addFacilityDevice(ctx.state.trx, {
      facility_id,
      device_id: to_add.device_id,
      serial_number: to_add.serial_number,
      created_by: admin.employment_id,
    })

    const success = encodeURIComponent(
      `Device added to your facility's inventory 🏥`,
    )

    return redirect(
      `/app/facilities/${facility_id}/inventory?success=${success}`,
    )
  },
}

export default async function DeviceAdd(
  _req: Request,
  { route, url, state }: FreshContext<LoggedInHealthWorker>,
) {
  let device: RenderedDevice | null = null
  const device_id = url.searchParams.get(
    'device_id',
  )
  if (device_id) {
    const result = await devices.search(
      state.trx,
      {
        ids: [parseInt(device_id)],
      },
    )
    assertOr404(result.length)
    device = result[0]
  }

  return (
    <Layout
      variant='home page'
      title='Add Device'
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <FacilityDeviceForm device={device} />
    </Layout>
  )
}
