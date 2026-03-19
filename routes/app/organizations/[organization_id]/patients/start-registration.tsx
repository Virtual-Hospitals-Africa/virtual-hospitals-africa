import z from 'zod'
import { assert } from 'std/assert/assert.ts'
import { patient_registration } from '../../../../../db/models/patient_registration.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'
import { OrganizationContext } from '../_middleware.ts'
import redirect from '../../../../../util/redirect.ts'
import { otherEmployeePresentWithPatient, PresentWithAnotherPatientError } from '../../../../../db/models/patient_workflows.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'

export const handler = postHandler(
  z.object({}),
  async (ctx: OrganizationContext) => {
    const { trx, organization, present_encounter_id, organization_employment } = ctx.state
    if (present_encounter_id) {
      const present_encounter = await patient_encounters.getById(trx, present_encounter_id)
      assert(patient_encounters.isOpen(present_encounter))
      const other_employee = await otherEmployeePresentWithPatient(trx, present_encounter, organization_employment)
      throw new PresentWithAnotherPatientError(present_encounter, other_employee)
    }
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
