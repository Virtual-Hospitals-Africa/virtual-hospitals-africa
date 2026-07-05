import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import TriageRoutePatientSection from '../../../../../../../../islands/triage/RoutePatientSection.tsx'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_presence } from '../../../../../../../../db/models/patient_presence.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { OpenEncounterWorkflowContext, TaskGroup, UpdateShape } from '../../../../../../../../types.ts'
import { DB } from '../../../../../../../../db.d.ts'
import { success } from '../../../../../../../../util/alerts.ts'
import { completeLastStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { TRIAGE_ROUTE_PATIENT_NEXT_STEPS, triageNextStepRecommendations } from '../../../../../../../../shared/triage_route_patient.ts'
import { startWorkflow } from '../start-workflow/[workflow].tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { redirectToFirstIncompleteStep } from '../index.tsx'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import { assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import { applyPermissions } from '../../../../../../../../shared/permissions.ts'
import { referrals } from '../../../../../../../../db/models/referrals.ts'

export const TriageRoutePatientSchema = z.object({
  next_step: z.enum(TRIAGE_ROUTE_PATIENT_NEXT_STEPS),
  notes: z.string().nullish(),
  health_worker_ids_to_be_notified: z.string().uuid().array().optional().default([]),
})

export const handler = postHandler(
  TriageRoutePatientSchema,
  async (ctx: OpenEncounterWorkflowContext, { next_step, health_worker_ids_to_be_notified }) => {
    const { trx, patient, patient_encounter_id, organization, organization_employment, health_worker_id } = ctx.state

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

      case 'hand_over': {
        throw new Error('todo')
      }

      case 'check_with_colleague': {
        const { redirect_to } = await promiseProps({
          completing_last_step,
          redirect_to: startWorkflow(
            ctx,
            'check_with_colleague',
            {
              planning: 'create_anew_every_time',
              patient_presence: 'move_into_specificed_workflow',
            },
          ),
          referral: referrals.insert(trx, {
            patient_id: patient.id,
            patient_encounter_id,
            organization_id: organization.id,
            employment_id: organization_employment.employment_id,
            originator_health_worker_id: health_worker_id,
            originator_avatar_url: ctx.state.health_worker.avatar_url!,
            health_worker_ids_to_be_notified,
          }),
        })
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

// While we have the evaluation_ids, this is not the time we do those tasks so we do not include them
async function managePatientTaskGroups(
  ctx: OpenEncounterWorkflowContext,
): Promise<TaskGroup[]> {
  const { trx, health_worker_id, encounter, open_encounter_pathname } = ctx.state
  const { task_groups } = await additional_tasks.getTasksGroups(trx, { health_worker_id, encounter })
  const some_non_manage_task_incomplete = task_groups.some((task_group) =>
    !task_group.completed && task_group.tasks.some((task) => task.atom === 'finding' || task.atom === 'measurement')
  )
  const is_emergency = encounter.priority?.name === 'Emergency'

  assertOrRedirect(is_emergency || !some_non_manage_task_incomplete, `${open_encounter_pathname}/triage/additional_tasks_and_investigations`)

  return task_groups
}

export async function PatientTriageRoutePatientPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    trx,
    patient,
    health_worker_id,
    organization_id,
    organization_employment,
    encounter,
  } = ctx.state
  const { reason, notes, priority } = encounter
  if (!priority) {
    return redirectToFirstIncompleteStep(ctx, { warning_message: 'Please complete triage before routing the patient' })
  }
  assert(completedPersonal(patient))

  const { clinic_employees, manage_patient_task_groups } = await promiseProps({
    clinic_employees: employees_presence.getAllAtOrganization(trx, {
      organization_id,
      excluding_health_worker: {
        health_worker_id,
        at_work: true,
        seniority_order: organization_employment.seniority_order,
      },
    }),
    manage_patient_task_groups: managePatientTaskGroups(ctx),
  })

  const task_groups_with_permissions = applyPermissions(organization_employment, clinic_employees, manage_patient_task_groups)
  const triage_next_step_recommendations = triageNextStepRecommendations(
    priority.name,
    clinic_employees,
    task_groups_with_permissions.flatMap((group) => group.tasks),
  )

  return (
    <TriageRoutePatientSection
      this_visit={{ reason, notes }}
      patient={patient}
      priority={priority}
      organization_id={organization_id}
      clinic_employees={clinic_employees}
      task_groups_with_permissions={task_groups_with_permissions}
      triage_next_step_recommendations={triage_next_step_recommendations}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientTriageRoutePatientPage)
