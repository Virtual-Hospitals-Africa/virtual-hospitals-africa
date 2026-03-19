import { z } from 'zod'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { OpenEncounterContext } from './_middleware.tsx'

import { success } from '../../../../../../../util/alerts.ts'
import { assertOr400 } from '../../../../../../../util/assertOr.ts'
import { otherEmployeePresentWithPatient } from '../../../../../../../db/models/patient_workflows.ts'
import { employeeDisplay } from '../../../../../../../util/healthWorkerDisplay.ts'

const MoveToWaitingRoomSchema = z.object({})

export const handler = postHandler(
  MoveToWaitingRoomSchema,
  async ({ params, state }: OpenEncounterContext) => {
    const { trx, encounter, organization_employment } = state

    const other_employee = await otherEmployeePresentWithPatient(trx, encounter, organization_employment)
    assertOr400(
      other_employee,
      'Leaving patients is only allowed when another health worker is tending to them',
    )

    await trx.updateTable('employment_presence')
      .set({
        with_patient_id: null,
        at_work: true,
      })
      .where('id', '=', organization_employment.employment_id)
      .execute()

    const next_url = success(
      `${encounter.patient.name} was left with ${employeeDisplay(other_employee).display_name}`,
      replaceParams(
        `/app/organizations/:organization_id/waiting_room`,
        params,
      ),
    )
    return redirect(next_url)
  },
)
