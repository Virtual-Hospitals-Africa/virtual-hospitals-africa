import { completeAndProceedToNextStep, completeStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { z } from 'zod'
import ThisVisitSection from '../../../../../../../../components/patient-registration/ThisVisitSection.tsx'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { patient_workflows } from '../../../../../../../../db/models/patient_workflows.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import { patient_encounters } from '../../../../../../../../db/models/patient_encounters.ts'
import { patient_presence } from '../../../../../../../../db/models/patient_presence.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import { success, warning } from '../../../../../../../../util/alerts.ts'
import { assert } from 'std/assert/assert.ts'
import { canPerform } from '../../../../../../../../shared/workflow.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { startWorkflow } from '../start-workflow.tsx'
import generateUUID from '../../../../../../../../util/uuid.ts'
import { organization_rooms } from '../../../../../../../../db/models/organization_rooms.ts'
import { UpdateShape } from '../../../../../../../../types.ts'
import { DB } from '../../../../../../../../db.d.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'

// TODO not hard code this
const senior_health_worker_name = 'Nomsa Moyo'

export const PatientRegistrationThisVisitSchema = z.object({
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
    const { trx, patient, encounter, organization, organization_employment } = ctx.state
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
        assert(completedPersonal(patient))

        const patient_workflow_id = generateUUID()

        const patient_presence_updates: UpdateShape<DB['patient_presence']> = {
          current_workflow: 'triage' as const,
          department_name: 'Triage' as const,
          next_workflow: 'registration' as const,
        }

        const first_available_room = await organization_rooms.findFirstOptional(
          trx,
          {
            organization_id: organization.id,
            department_name: 'Triage',
            is_available: true,
          },
        )
        if (first_available_room) {
          assert(!first_available_room.occupied_by_patient)
          patient_presence_updates.organization_room_id = first_available_room.id
        }

        await Promise.all([
          completeStep(ctx),
          patient_workflows.insertOne(trx, {
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
          return startWorkflow(ctx, 'triage', { planning: 'only_if_planned' }).then(redirect)
        }

        await events.insert(trx, {
          type: 'ImmediateTriage',
          data: {
            patient_encounter_id: encounter.patient_encounter_id,
            requested_by_employee_id: organization_employment.employment_id,
          },
        })

        const redirect_success_message = first_available_room
          ? `Please move ${patient.names.preferred_name} to ${first_available_room.name}. ${senior_health_worker_name} has been notified.`
          : `No rooms yet available for triage. Please stay with ${patient.names.preferred_name}. ${senior_health_worker_name} has been notified to come as soon as possible.`

        // TODO notify senior_health_worker_name
        return redirect(success(
          redirect_success_message,
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
  const can_do_triage = !!canPerform(organization_employment, 'triage')
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
      staff_availability={[
        {
          name: 'Sarah Ndlovu',
          role: 'Nurse',
          activity: 'Assessing routine case',
          location: 'Patient room 2',
          estimated_minutes: 2,
          status: 'available_soon',
        },
        {
          name: 'Nomsa Moyo',
          role: 'Nurse',
          activity: 'Initial assessment in progress',
          location: 'Patient Room 1',
          estimated_minutes: 8,
          status: 'busy',
        },
      ]}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientRegistrationThisVisitPage)
