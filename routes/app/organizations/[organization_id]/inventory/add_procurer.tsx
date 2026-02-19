import { z } from 'zod'
import redirect from '../../../../../util/redirect.ts'
import { inventory } from '../../../../../db/models/inventory.ts'
import { assertOr403 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import ProcurerForm from '../../../../../islands/inventory/ProcurerForm.tsx'
import { HealthWorkerHomePage } from '../../../_middleware.tsx'
import roleByProfession from '../../../../../shared/roleByProfession.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'

const AddProcurerSchema = z.object({
  name: z.string(),
}).describe('Add procurer')

export const handler = postHandler(
  AddProcurerSchema,
  async (ctx: OrganizationContext, to_upsert) => {
    const admin_role = roleByProfession(
      ctx.state.organization_employment,
      'admin',
    )
    assertOr403(admin_role)

    const { organization_id } = ctx.params

    await inventory.upsertProcurer(ctx.state.trx, to_upsert)

    const success = encodeURIComponent(
      `Procurer added successfully!`,
    )

    return redirect(
      `/app/organizations/${organization_id}/inventory?active_tab=consumables&success=${success}`,
    )
  },
)

export default HealthWorkerHomePage(
  'Add Procurer',
  ProcurerForm,
)
