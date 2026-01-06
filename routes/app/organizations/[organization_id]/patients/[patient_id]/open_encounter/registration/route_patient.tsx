import {
  completeLastStep,
  nextRouteAfterCompletingWorkflow,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { updateForOpenEncounterAfterCompletingWorkflow } from '../../../../../../../../db/models/patient_presence.ts'

import * as patient_encounters from '../../../../../../../../db/models/patient_encounters.ts'
import * as patient_presence from '../../../../../../../../db/models/patient_presence.ts'
import { canPerform } from '../../../../../../../../shared/workflow.ts'

import { assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import RegistrationRoutePatientSection from '../../../../../../../../components/patient-registration/RoutePatientSection.tsx'
import { success, warning } from '../../../../../../../../util/alerts.ts'
import { startWorkflow } from '../start-workflow.tsx'
import { assertEquals } from 'std/assert/assert_equals.ts'

// TODO not hard code this
const senior_health_worker_name = 'Nomsa Moyo'

const PatientRegistrationRoutePatientSchema = z.object({
  next_workflow: z.enum([
    'await_triage',
    'immediate_triage',
    'call_for_help',
  ]),
  notes: z.string().optional(),
})

export const handler = postHandler(
  PatientRegistrationRoutePatientSchema,
  async (ctx: OpenEncounterWorkflowContext, { next_workflow, notes }) => {
    const { trx, patient, encounter, organization, organization_employment } =
      ctx.state
    const can_do_triage = canPerform(organization_employment, 'triage')

    const { next_patient_presence } = await promiseProps({
      completed_last_step: completeLastStep(ctx),
      next_patient_presence: updateForOpenEncounterAfterCompletingWorkflow(
        trx,
        encounter,
        organization_employment,
      ),
      updating_encounter: patient_encounters.updateOne(
        trx,
        encounter.patient_encounter_id,
        { reason: 'seeking treatment', notes },
      ),
    })

    switch (next_workflow) {
      case 'await_triage': {
        return redirect(
          nextRouteAfterCompletingWorkflow(ctx, next_patient_presence),
        )
      }
      case 'immediate_triage': {
        assertEquals(encounter.workflows.triage?.status, 'not started')

        const patient_presence_updates = {
          current_workflow: 'triage' as const,
          department_name: 'triage' as const,
          next_workflow: 'consultation' as const,
        }

        await patient_presence.set(trx, patient.id, patient_presence_updates)

        // Update the encounter in line rather than refetching
        Object.assign(
          encounter.status.patient_presence,
          patient_presence_updates,
        )

        if (can_do_triage) {
          return startWorkflow(ctx, 'triage')
        }
        // TODO notify senior_health_worker_name
        return redirect(success(
          `${
            patient.names!.preferred_name
          } has been moved to triage and ${senior_health_worker_name} has been notified.`,
          `/app/organizations/${organization.id}/waiting_room`,
        ))
      }
      default: {
        throw new Error('Not yet supported')
      }
    }
  },
)

// deno-lint-ignore require-await
export async function PatientRegistrationRoutePatientPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    patient,
    organization_employment,
    encounter: { reason, notes },
  } = ctx.state
  const can_do_triage = canPerform(organization_employment, 'triage')
  assertOrRedirect(
    patient.names,
    warning(
      'The personal section must be completed first',
      ctx.url.pathname.replace('/this_visit', '/personal'),
    ),
  )
  return (
    <RegistrationRoutePatientSection
      this_visit={{ reason, notes }}
      patient_names={patient.names}
      senior_health_worker_name={senior_health_worker_name}
      can_do_triage={can_do_triage}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationRoutePatientPage)
