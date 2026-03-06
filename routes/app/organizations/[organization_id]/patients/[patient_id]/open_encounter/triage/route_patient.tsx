import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'

import TriageRoutePatientSection from '../../../../../../../../islands/triage/RoutePatientSection.tsx'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'
import { assert } from 'std/assert/assert.ts'

import { patient_presence } from '../../../../../../../../db/models/patient_presence.ts'

import redirect from '../../../../../../../../util/redirect.ts'

import { pronoun } from '../../../../../../../../shared/sex_and_gender.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { UpdateShape } from '../../../../../../../../types.ts'
import { DB } from '../../../../../../../../db.d.ts'
import { success } from '../../../../../../../../util/alerts.ts'
import { completeLastStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
// import { startWorkflow } from '../start-workflow.tsx'
//

// TODO not hard code this

const next_workflow_steps = [
  'await_consultation' as const,
  'refer_case' as const,
  'transfer_to_stabilization_area' as const,
]

type NextWorkflowStep = typeof next_workflow_steps[number]

export const TriageRoutePatientSchema = z.object({
  next_workflow: z.enum(next_workflow_steps),
  notes: z.string().optional(),
})

export const handler = postHandler(
  TriageRoutePatientSchema,
  async (ctx: OpenEncounterWorkflowContext, { next_workflow /*, notes */ }) => {
    const { trx, patient, organization, organization_employment } = ctx.state

    assert(completedPersonal(patient))
    const completing_last_step = completeLastStep(ctx)

    switch (next_workflow) {
      case 'await_consultation': {
        const patient_presence_updates: UpdateShape<DB['patient_presence']> = {
          current_workflow: null,
          department_name: 'Waiting room' as const,
          next_workflow: 'consultation' as const,
        }
        await Promise.all([
          completing_last_step,
          patient_presence.set(trx, patient.id, patient_presence_updates),
          trx.updateTable('employment_presence')
            .set({ with_patient_id: null })
            .where(
              'employment_presence.id',
              '=',
              organization_employment.employment_id,
            )
            .execute(),
        ])

        const redirect_success_message = `Please move ${patient.names.preferred_name} to the waiting room. The next available triage nurse will see ${
          pronoun(patient)
        }.`

        // TODO notify senior_health_worker_name
        return redirect(success(
          redirect_success_message,
          `/app/organizations/${organization.id}/waiting_room`,
        ))
      }
      // case 'refer_case': {

      // }
      // case 'transfer_to_stabilization_area': {

      // }
      default: {
        throw new Error('Not yet supported')
      }
    }
  },
)

export async function PatientRegistrationRoutePatientPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    patient,
    encounter: { reason, notes, priority },
  } = ctx.state
  assert(
    patient.names,
  )
  const { facility_employees, hospital_employees } = await employees_presence.getForClinicAssumingTestHospital(
    ctx.state.trx,
    ctx.state,
  )
  assert(priority)

  return (
    <TriageRoutePatientSection
      this_visit={{ reason, notes }}
      patient_names={patient.names}
      priority={priority}
      facility_employees={facility_employees}
      hospital_employees={hospital_employees}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationRoutePatientPage)
