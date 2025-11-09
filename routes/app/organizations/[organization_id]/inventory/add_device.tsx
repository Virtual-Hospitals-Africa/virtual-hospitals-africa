import {
  LoggedInHealthWorkerContext,
  RenderedDevice,
} from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import OrganizationDeviceForm from '../../../../../components/inventory/DeviceForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import * as inventory from '../../../../../db/models/inventory.ts'

import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import devices from '../../../../../db/models/devices.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import roleByProfession from '../../../../../shared/roleByProfession.ts'

export function assertIsUpsertDevice(
  obj: unknown,
): asserts obj is { device_id: string; serial_number?: string } {
  assertOr400(isObjectLike(obj))
  assertOr400(typeof obj.device_id === 'string')
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
      ctx.state.trx,
      req,
      assertIsUpsertDevice,
    )

    await inventory.addOrganizationDevice(ctx.state.trx, {
      organization_id,
      device_id: to_add.device_id,
      serial_number: to_add.serial_number,
      created_by: admin_role.employment_id,
    })

    const success = encodeURIComponent(
      `Device added to your organization's inventory 🏥`,
    )

    return redirect(
      `/app/organizations/${organization_id}/inventory?success=${success}`,
    )
  },
}

export default HealthWorkerHomePageLayout(
  'Add Device',
  async function DeviceAdd(
    { url, state }: LoggedInHealthWorkerContext,
  ) {
    let device: RenderedDevice | null = null
    const device_id = url.searchParams.get(
      'device_id',
    )
    if (device_id) {
      device = await devices.getById(state.trx, device_id)
    }

    return <OrganizationDeviceForm device={device} />
  },
)
