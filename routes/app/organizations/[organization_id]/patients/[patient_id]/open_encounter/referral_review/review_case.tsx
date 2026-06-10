import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import ReviewCaseSection from '../../../../../../../../islands/triage/RoutePatientSection.tsx'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_presence } from '../../../../../../../../db/models/patient_presence.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { OpenEncounterWorkflowContext, UpdateShape } from '../../../../../../../../types.ts'
import { DB } from '../../../../../../../../db.d.ts'
import { success } from '../../../../../../../../util/alerts.ts'
import { completeLastStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { startWorkflow } from '../start-workflow.tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { redirectToFirstIncompleteStep } from '../index.tsx'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import { assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import { isManage } from '../../../../../../../../shared/tasks.ts'
import partition from '../../../../../../../../util/partition.ts'
import { notifications } from '../../../../../../../../db/models/notifications.ts'
import { assertArrayNonEmpty } from '../../../../../../../../util/arraySize.ts'
import { assertUnreachable } from '../../../../../../../../util/assertUnreachable.ts'

export const ReviewCaseSchema = z.object({
  next_step: z.enum([
    'accept_case',
    'rerefer'
  ]),
  notes: z.string().nullish(),
  health_worker_ids_to_be_notified: z.string().uuid().array().optional().default([]),
})

export const handler = postHandler(
  ReviewCaseSchema,
  async (ctx: OpenEncounterWorkflowContext, { next_step, health_worker_ids_to_be_notified }) => {
    const { trx, patient, organization, organization_employment } = ctx.state

    assert(completedPersonal(patient))
    const completing_last_step = completeLastStep(ctx)

    switch (next_step) {
      case 'accept_case': {
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
      case 'rerefer': {
        const patient_presence_updates: UpdateShape<DB['patient_presence']> = {
          current_workflow: null,
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

        assertArrayNonEmpty(health_worker_ids_to_be_notified)
        for (const to_notify_id of health_worker_ids_to_be_notified) {
          await notifications.insert(
            ctx.state.trx,
            {
              action_title: 'Referral',
              action_href: '#todo',
              avatar_url: ctx.state.health_worker.avatar_url!,
              description: `A case was referred to you`,
              patient_encounter_id: ctx.state.patient_encounter_id,
              table_name: 'patient_encounters',
              row_id: ctx.state.patient_encounter_id,
              notification_type: 'case_referral',
              title: 'Case Referral',
              health_worker_id: to_notify_id,
            },
          )
        }
        return redirect(redirect_to)
      }
      // case 'stabilize_patient': {

      // }
      default: {
        assertUnreachable(next_step)
      }
    }
  },
)

// While we have the evaluation_ids, this is not the time we do those tasks so we do not include them
async function managePatientTasks(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, health_worker_id, encounter, open_encounter_pathname } = ctx.state
  const { task_groups } = await additional_tasks.getTasksGroups(trx, { health_worker_id, encounter })
  const some_non_manage_task_incomplete = task_groups.some((task_group) =>
    !task_group.completed && task_group.tasks.some((task) => task.atom === 'finding' || task.atom === 'measurement')
  )
  const is_emergency = encounter.priority?.name === 'Emergency'

  assertOrRedirect(is_emergency || !some_non_manage_task_incomplete, `${open_encounter_pathname}/triage/additional_tasks_and_investigations`)

  const manage_patient_tasks = task_groups.flatMap((task_group) => task_group.tasks.filter(isManage))
  return manage_patient_tasks
}

export async function PatientReviewCasePage(
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

  const { clinic_employees, manage_patient_tasks } = await promiseProps({
    clinic_employees: employees_presence.findAll(trx, {
      organization_id,
      excluding_health_worker_id: health_worker_id,
    }),
    manage_patient_tasks: managePatientTasks(ctx),
  })

  const [tasks_i_can_do, tasks_for_another] = partition(manage_patient_tasks, (task) => {
    const { permissions } = task
    if (!permissions?.length) return true
    return permissions.some((p) =>
      p.role === (organization_employment.role as 'doctor' | 'nurse' | 'specialist') &&
        !p.specialty || (organization_employment.active_licences.some((licence: { specialty: string | null }) => licence.specialty === p.specialty))
    )
  })

  return (
    <ReviewCaseSection
      this_visit={{ reason, notes }}
      patient={patient}
      priority={priority}
      clinic_employees={clinic_employees}
      tasks_i_can_do={tasks_i_can_do}
      tasks_for_another={tasks_for_another}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientReviewCasePage)
