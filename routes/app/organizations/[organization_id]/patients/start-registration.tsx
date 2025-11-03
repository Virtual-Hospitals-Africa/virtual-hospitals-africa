import z from 'zod'
import * as patient_registration from '../../../../../db/models/patient_registration.ts'
import { postHandler } from '../../../../../util/postHandler.ts'
import { OrganizationContext } from '../_middleware.ts'
import redirect from '../../../../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'

export const handler = postHandler(
  z.object({}),
  async (ctx: OrganizationContext) => {
    const { trx, organization, health_worker, organization_employment } =
      ctx.state
    const { success, patient_id } = await patient_registration.start(
      trx,
      organization,
      health_worker,
      organization_employment,
    )
    assert(success)
    return redirect(
      `/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/personal`,
    )
  },
)
