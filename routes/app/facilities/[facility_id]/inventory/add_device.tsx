import { assert } from 'std/assert/assert.ts'
import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  FacilityDevice,
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import FacilityDeviceForm from '../../../../../islands/inventory/Device.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { FacilityContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import omit from '../../../../../util/omit.ts'

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
    const { isAdminAtFacility, healthWorker } = ctx.state

    assertOr403(isAdminAtFacility)
    const facility_id = getRequiredNumericParam(ctx, 'facility_id')

    const to_add = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsUpsertDevice,
    )

    const matching_employment = healthWorker.employment.find((employment) =>
      employment.facility.id === facility_id
    )
    assertOr403(matching_employment)
    assertOr403(matching_employment.roles.admin)

    await inventory.addFacilityDevice(ctx.state.trx, {
      device_id: to_add.device_id,
      serial_number: to_add.serial_number,
      created_by: matching_employment.roles.admin.employment_id,
      facility_id: facility_id,
    })

    const success = encodeURIComponent(
      `Device added to your facility's inventory 🏥`,
    )

    return redirect(
      `/app/facilities/${facility_id}/inventory?success=${success}`,
    )
  },
}

// deno-lint-ignore require-await
export default async function DeviceAdd(
  _req: Request,
  { route, url, state }: FreshContext<LoggedInHealthWorker>,
) {
  return (
    <Layout
      variant='home page'
      title='Add Device'
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <Container size='md'>
        <FacilityDeviceForm />
      </Container>
    </Layout>
  )
}
