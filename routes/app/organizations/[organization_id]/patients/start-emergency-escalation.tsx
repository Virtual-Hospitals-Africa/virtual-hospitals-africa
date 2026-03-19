import z from 'zod'
import { assert } from 'std/assert/assert.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'
import { OrganizationContext } from '../_middleware.ts'
import redirect from '../../../../../util/redirect.ts'
import { waiting_room } from '../../../../../db/models/waiting_room.ts'
import { patient_new } from '../../../../../db/models/patient_new.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'

export const handler = postHandler(
  z.object({}),
  async (ctx: OrganizationContext) => {
    const { trx, organization, organization_employment, present_encounter_id } = ctx.state
    // No time to fidget with your current patient, just say they're in the waiting room
    if (present_encounter_id) {
      // TODO, this feels a bit slow to get the whole thing as we likely don't need everything
      const present_encounter = await patient_encounters.getById(trx, present_encounter_id)
      assert(patient_encounters.isOpen(present_encounter))
      await waiting_room.moveTo(trx, { organization, organization_employment, encounter: present_encounter })
    }
    // We may end up deleting this patient later if an existing patient can be identified
    const { success, patient_id } = await patient_new.create(
      trx,
      { organization, organization_employment, current_workflow: 'emergency_escalation', next_workflows: ['stabilization'] },
    )
    assert(success)
    return redirect(
      `/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/emergency_escalation/identify_patient`,
    )
  },
)
