import { z } from 'zod'
import { postHandler } from '../../../../../../../util/postHandler.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { OpenEncounterContext } from './_middleware.tsx'
import { InsertShape } from '../../../../../../../types.ts'
import {
  EmploymentPresence,
  PatientPresence,
} from '../../../../../../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { success } from '../../../../../../../util/alerts.ts'

const MoveToWaitingRoomSchema = z.object({})

export const handler = postHandler(
  MoveToWaitingRoomSchema,
  async (_req, ctx: OpenEncounterContext) => {
    const { organization, organization_employment, encounter } = ctx.state

    if (encounter.status.patient_presence.current_workflow) {
      const patient_presence: InsertShape<PatientPresence> = {
        id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        organization_id: organization.id,
        current_workflow: null,
        next_workflow: encounter.status.patient_presence.current_workflow,
        department_name: 'waiting room',
      }

      await ctx.state.trx.insertInto('patient_presence').values(
        patient_presence,
      )
        .onConflict((oc) => oc.column('id').doUpdateSet(patient_presence))
        .execute()

      assert(
        encounter.status.patient_presence.employees.length <= 1,
        "Moving patient to waiting room when other employees also with patient isn't supported",
      )
      const employee_present_with_patient =
        encounter.status.patient_presence.employees[0]
      assert(employee_present_with_patient)

      assert(organization_employment.non_admin_id)
      assertEquals(
        employee_present_with_patient.employment_id,
        organization_employment.non_admin_id,
      )

      const employment_presence: InsertShape<EmploymentPresence> = {
        id: organization_employment.non_admin_id,
        with_patient_id: null,
        at_work: true,
      }

      await ctx.state.trx.insertInto('employment_presence').values(
        employment_presence,
      )
        .onConflict((oc) => oc.column('id').doUpdateSet(employment_presence))
        .execute()
    }

    const next_url = success(
      `${encounter.patient.name} was moved to the waiting room`,
      replaceParams(
        `/app/organizations/:organization_id/waiting_room`,
        ctx.params,
      ),
    )
    return redirect(next_url)
  },
)
