import z from 'zod'
import { assert } from 'std/assert/assert.ts'
import { patient_registration } from '../../../../../db/models/patient_registration.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'
import { OrganizationContext } from '../_middleware.ts'
import redirect from '../../../../../util/redirect.ts'
import { assertNoPresentEncounter } from '../../../../../db/models/patient_workflows.ts'

export const handler = postHandler(
  z.object({}),
  async (ctx: OrganizationContext) => {
    const { trx, organization, present_encounter, organization_employment } = ctx.state
    assertNoPresentEncounter(present_encounter, organization_employment)
    const { success, patient_id } = await patient_registration.start(
      trx,
      organization,
      organization_employment,
    )
    assert(success)
    return redirect(
      `/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/personal`,
    )
  },
)
