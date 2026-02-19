import { z } from 'zod'
import { LoggedInHealthWorkerContext, RenderedDevice } from '../../../../../types.ts'
import redirect from '../../../../../util/redirect.ts'
import OrganizationDeviceForm from '../../../../../components/inventory/DeviceForm.tsx'
import { inventory } from '../../../../../db/models/inventory.ts'
import { assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import devices from '../../../../../db/models/devices.ts'
import { HealthWorkerHomePage } from '../../../_middleware.tsx'
import roleByProfession from '../../../../../shared/roleByProfession.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'

const AddDeviceSchema = z.object({
  device_id: z.string(),
  serial_number: z.string().optional(),
}).describe('Add device')

export const handler = postHandler(
  AddDeviceSchema,
  async (ctx: OrganizationContext, to_add) => {
    const admin_role = roleByProfession(
      ctx.state.organization_employment,
      'admin',
    )
    assertOr403(admin_role)

    const { organization_id } = ctx.params

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
)

export default HealthWorkerHomePage(
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
