import {
  completeLastStep,
  // completeStep,
  // nextRouteAfterCompletingWorkflow,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import redirect from '../../../../../../../../util/redirect.ts'
// import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
// import { updateForOpenEncounterAfterCompletingWorkflow } from '../../../../../../../../db/models/patient_presence.ts'
import * as patient_workflows from '../../../../../../../../db/models/patient_workflows.ts'
// import * as events from '../../../../../../../../db/models/events.ts'
// import * as patient_encounters from '../../../../../../../../db/models/patient_encounters.ts'
import * as patient_presence from '../../../../../../../../db/models/patient_presence.ts'
import { canPerform } from '../../../../../../../../shared/workflow.ts'

import { assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import RegistrationRoutePatientSection from '../../../../../../../../components/patient-registration/RoutePatientSection.tsx'
import { success, warning } from '../../../../../../../../util/alerts.ts'
// import { startWorkflow } from '../start-workflow.tsx'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
// import { organization_rooms } from '../../../../../../../../db/models/organization_rooms.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { UpdateShape } from '../../../../../../../../types.ts'
// import generateUUID from '../../../../../../../../util/uuid.ts'
import { DB } from '../../../../../../../../db.d.ts'
import { pronoun } from '../../../../../../../../shared/sex_and_gender.ts'

// TODO not hard code this
const senior_health_worker_name = 'Nomsa Moyo'

export const PatientRegistrationRoutePatientSchema = z.object({
  next_workflow: z.enum([
    'await_triage',
    'immediate_triage',
    'call_for_help',
  ]),
  notes: z.string().optional(),
})

export const handler = postHandler(
  PatientRegistrationRoutePatientSchema,
  async (ctx: OpenEncounterWorkflowContext, { next_workflow /*, notes */ }) => {
    const { trx, patient, encounter, organization, organization_employment } =
      ctx.state

    assertEquals(next_workflow, 'await_triage')
    // const can_do_triage = canPerform(organization_employment, 'triage')

    assert(!encounter.workflows.triage)
    assert(completedPersonal(patient))

    const patient_presence_updates: UpdateShape<DB['patient_presence']> = {
      current_workflow: null,
      department_name: 'Waiting room' as const,
      next_workflow: 'triage' as const,
    }

    await Promise.all([
      completeLastStep(ctx),
      patient_workflows.insert(trx, [
        {
          patient_encounter_id: encounter.patient_encounter_id,
          workflow: 'triage' as const,
        },
        {
          patient_encounter_id: encounter.patient_encounter_id,
          workflow: 'consultation' as const,
        },
      ]),
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

    // if (can_do_triage) {
    //   // Update the encounter in line rather than refetching
    //   encounter.workflows.triage = {
    //     patient_workflow_id,
    //     workflow: 'triage',
    //     status: 'not started',
    //     steps_completed: [],
    //     seen_patient_encounter_employee_ids: [],
    //   }
    //   Object.assign(
    //     encounter.status.patient_presence,
    //     patient_presence_updates,
    //   )
    //   return startWorkflow(ctx, 'triage')
    // }

    // await events.insert(trx, {
    //   type: 'ImmediateTriage',
    //   data: {
    //     patient_encounter_id: encounter.patient_encounter_id,
    //     requested_by_employee_id: organization_employment.employment_id,
    //   },
    // })

    // TODO: time estimate
    const redirect_success_message =
      `Please move ${patient.names.preferred_name} to the waiting room. The next available triage nurse will see ${
        pronoun(patient)
      }.`

    // TODO notify senior_health_worker_name
    return redirect(success(
      redirect_success_message,
      `/app/organizations/${organization.id}/waiting_room`,
    ))

    // const { next_patient_presence } = await promiseProps({
    //   completed_last_step: completeLastStep(ctx),
    // next_patient_presence: updateForOpenEncounterAfterCompletingWorkflow(
    //   trx,
    //   encounter,
    //   organization_employment,
    // ),
    //   updating_encounter: patient_encounters.updateOne(
    //     trx,
    //     encounter.patient_encounter_id,
    //     { reason: 'seeking treatment', notes },
    //   ),
    // })

    // switch (next_workflow) {
    //   case 'await_triage': {
    //     const patient_presence_updates = {
    //       current_workflow: null,
    //       department_name: 'Waiting room' as const,
    //       next_workflow: 'triage' as const,
    //     }

    //     await patient_presence.set(trx, patient.id, patient_presence_updates)

    //     // Update the encounter in line rather than refetching
    //     Object.assign(
    //       encounter.status.patient_presence,
    //       patient_presence_updates,
    //     )

    //     return redirect(
    //       nextRouteAfterCompletingWorkflow(ctx, next_patient_presence),
    //     )
    //   }
    //   case 'immediate_triage': {
    //     assertEquals(encounter.workflows.triage?.status, 'not started')

    //     const patient_presence_updates = {
    //       current_workflow: 'triage' as const,
    //       department_name: 'Waiting room' as const,
    //       next_workflow: 'consultation' as const,
    //     }

    //     await patient_presence.set(trx, patient.id, patient_presence_updates)

    //     // Update the encounter in line rather than refetching
    //     Object.assign(
    //       encounter.status.patient_presence,
    //       patient_presence_updates,
    //     )

    //     if (can_do_triage) {
    //       return startWorkflow(ctx, 'triage')
    //     }
    //     // TODO notify senior_health_worker_name
    //     return redirect(success(
    //       `${
    //         patient.names!.preferred_name
    //       } has been moved to triage and ${senior_health_worker_name} has been notified.`,
    //       `/app/organizations/${organization.id}/waiting_room`,
    //     ))
    //   }
    //   default: {
    //     throw new Error('Not yet supported')
    //   }
    // }
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
