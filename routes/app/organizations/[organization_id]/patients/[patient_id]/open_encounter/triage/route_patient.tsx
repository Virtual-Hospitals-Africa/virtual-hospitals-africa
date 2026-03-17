import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import TriageRoutePatientSection from '../../../../../../../../islands/triage/RoutePatientSection.tsx'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_presence } from '../../../../../../../../db/models/patient_presence.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { UpdateShape } from '../../../../../../../../types.ts'
import { DB } from '../../../../../../../../db.d.ts'
import { success } from '../../../../../../../../util/alerts.ts'
import { completeLastStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { TRIAGE_ROUTE_PATIENT_NEXT_STEPS } from '../../../../../../../../shared/triage_route_patient.ts'
import { startWorkflow } from '../start-workflow.tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { redirectToFirstIncompleteStep } from '../index.tsx'

export const TriageRoutePatientSchema = z.object({
  next_step: z.enum(TRIAGE_ROUTE_PATIENT_NEXT_STEPS),
  notes: z.string().nullish(),
  health_worker_ids_to_be_notified: z.string().uuid().array(),
})

export const handler = postHandler(
  TriageRoutePatientSchema,
  async (ctx: OpenEncounterWorkflowContext, { next_step /*, notes */ }) => {
    const { trx, patient, organization, organization_employment } = ctx.state

    assert(completedPersonal(patient))
    const completing_last_step = completeLastStep(ctx)

    switch (next_step) {
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

        const redirect_success_message = `Please escort ${patient.names.preferred_name} to the waiting room to await consultation.`

        return redirect(success(
          redirect_success_message,
          `/app/organizations/${organization.id}/waiting_room`,
        ))
      }
      case 'refer_case': {
        const { redirect_to } = await promiseProps({
          completing_last_step,
          redirect_to: startWorkflow(
            ctx,
            'referral_placed',
            {
              planning: 'create_anew_every_time',
              patient_presence: 'move_into_specificed_workflow',
            },
          ),
        })
        // add the referral_placed workflow and redirect you there
        // Notify other staff member

        return redirect(redirect_to)
      }
      // case 'stabilize_patient': {

      // }
      default: {
        throw new Error('Not yet supported')
      }
    }
  },
)

export async function PatientTriageRoutePatientPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    trx,
    patient,
    health_worker_id,
    organization_id,
    encounter: { reason, notes, priority },
  } = ctx.state
  if (!priority) {
    return redirectToFirstIncompleteStep(ctx, { warning_message: 'Please complete triage before routing the patient' })
  }
  assert(completedPersonal(patient))

  const clinic_employees = await employees_presence.findAll(trx, {
    organization_id,
    excluding_health_worker_id: health_worker_id,
  })

  return (
    <TriageRoutePatientSection
      this_visit={{ reason, notes }}
      patient={patient}
      priority={priority}
      clinic_employees={clinic_employees}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientTriageRoutePatientPage)
