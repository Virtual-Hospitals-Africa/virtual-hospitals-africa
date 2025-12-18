import {
  completeAndProceedToNextStep,
  completeStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import ThisVisitSection from '../../../../../../../../components/patient-registration/ThisVisitSection.tsx'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import * as patient_workflows from '../../../../../../../../db/models/patient_workflows.ts'
import * as patient_encounters from '../../../../../../../../db/models/patient_encounters.ts'
import * as patient_presence from '../../../../../../../../db/models/patient_presence.ts'
import * as events from '../../../../../../../../db/models/events.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import { success, warning } from '../../../../../../../../util/alerts.ts'
import { assert } from 'std/assert/assert.ts'
import { canPerform } from '../../../../../../../../shared/workflow.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { startWorkflow } from '../start-workflow.tsx'
import generateUUID from '../../../../../../../../util/uuid.ts'

// TODO not hard code this
const senior_health_worker_name = 'Nomsa Moyo'

const PatientRegistrationThisVisitSchema = z.object({
  next_workflow: z.enum([
    'continue_with_registration',
    'immediate_triage',
    'call_for_help',
  ]),
  notes: z.string().optional(),
})

export const handler = postHandler(
  PatientRegistrationThisVisitSchema,
  async (ctx: OpenEncounterWorkflowContext, { next_workflow, notes }) => {
    const { trx, patient, encounter, organization, organization_employment } =
      ctx.state
    const can_do_triage = canPerform(organization_employment, 'triage')

    switch (next_workflow) {
      case 'continue_with_registration': {
        const { response } = await promiseProps({
          updating_encounter: patient_encounters.updateOne(
            trx,
            encounter.patient_encounter_id,
            { reason: 'seeking treatment', notes },
          ),
          response: completeAndProceedToNextStep(ctx),
        })
        return response
      }
      case 'immediate_triage': {
        assert(!encounter.workflows.triage)

        const patient_workflow_id = generateUUID()

        const patient_presence_updates = {
          current_workflow: 'triage' as const,
          department_name: 'Triage' as const,
          next_workflow: 'registration' as const,
        }

        await Promise.all([
          completeStep(ctx),
          patient_workflows.insert(trx, {
            id: patient_workflow_id,
            patient_encounter_id: encounter.patient_encounter_id,
            workflow: 'triage',
          }),
          patient_presence.set(trx, patient.id, patient_presence_updates),
          !can_do_triage && trx.updateTable('employment_presence')
            .set({ with_patient_id: null })
            .where(
              'employment_presence.id',
              '=',
              organization_employment.employment_id,
            )
            .execute(),
        ])

        if (can_do_triage) {
          // Update the encounter in line rather than refetching
          encounter.workflows.triage = {
            patient_workflow_id,
            workflow: 'triage',
            status: 'not started',
            steps_completed: [],
            seen_patient_encounter_employee_ids: [],
          }
          Object.assign(
            encounter.status.patient_presence,
            patient_presence_updates,
          )
          return startWorkflow(ctx, 'triage')
        }

        await events.insert(trx, {
          type: 'ImmediateTriage',
          data: {
            patient_encounter_id: encounter.patient_encounter_id,
            requested_by_employee_id: organization_employment.employment_id,
          },
        })

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
export async function PatientRegistrationThisVisitPage(
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
    <ThisVisitSection
      this_visit={{ reason, notes }}
      patient_names={patient.names}
      senior_health_worker_name={senior_health_worker_name}
      can_do_triage={can_do_triage}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationThisVisitPage)
