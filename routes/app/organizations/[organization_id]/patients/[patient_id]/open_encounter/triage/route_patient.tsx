import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import TriageRoutePatientSection from '../../../../../../../../islands/triage/RoutePatientSection.tsx'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_presence } from '../../../../../../../../db/models/patient_presence.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import {
  OpenEncounterWorkflowContext,
  RenderedFindingRelativeToHealthWorker,
  RenderedSidebarWorkflow,
  TaskGroup,
  UpdateShape,
} from '../../../../../../../../types.ts'
import { DB } from '../../../../../../../../db.d.ts'
import { success } from '../../../../../../../../util/alerts.ts'
import { completeLastStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { TRIAGE_ROUTE_PATIENT_NEXT_STEPS, triageNextStepRecommendations } from '../../../../../../../../shared/triage_route_patient.ts'
import { startWorkflow } from '../start-workflow/[workflow].tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { redirectToFirstIncompleteStep } from '../index.tsx'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import { assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import { applyPermissions, applyPrescriberPermissions } from '../../../../../../../../shared/permissions.ts'
import { buildCarePlanGroups } from '../../../../../../../../shared/care_plan.ts'
import { referrals } from '../../../../../../../../db/models/referrals.ts'
import { positiveRecordsFromEncounter } from '../../../../../../../../shared/recommended_dose_calculator/patient_case_from_encounter.ts'
import { PatientCaseSchema } from '../../../../../../../../shared/recommended_doses.ts'
import { recommended_dose_calculator } from '../../../../../../../../db/models/recommended_dose_calculator.ts'
import { caseReferralNotificationDescription } from '../../../../../../../../shared/notifications/case_referral_notification.ts'
import { employeeDisplay } from '../../../../../../../../util/healthWorkerDisplay.ts'
import { priorityOrder } from '../../../../../../../../shared/sats.ts'
import sortBy from '../../../../../../../../util/sortBy.ts'
import first from '../../../../../../../../util/first.ts'

function presentingIssueFromTriageFindings(
  this_visit_findings: RenderedSidebarWorkflow[],
): string | null {
  const positive_findings: RenderedFindingRelativeToHealthWorker[] = this_visit_findings.flatMap(
    (workflow) =>
      workflow.steps
        .filter((step) =>
          step.workflow_step === 'warning_signs' ||
          step.workflow_step === 'additional_tasks_and_investigations'
        )
        .flatMap((step) =>
          step.records.flatMap((record) =>
            record.type === 'finding' &&
              record.existence === 'Yes' &&
              record.value?.type !== 'measurement'
              ? [record]
              : []
          )
        ),
  )

  return first(sortBy(positive_findings, priorityOrder))?.displays.finding ?? null
}

export const TriageRoutePatientSchema = z.object({
  next_step: z.enum(TRIAGE_ROUTE_PATIENT_NEXT_STEPS),
  notes: z.string().nullish(),
  health_worker_ids_to_be_notified: z.string().uuid().array().optional().default([]),
})

export const handler = postHandler(
  TriageRoutePatientSchema,
  async (ctx: OpenEncounterWorkflowContext, { next_step, health_worker_ids_to_be_notified }) => {
    const {
      trx,
      patient,
      patient_encounter_id,
      organization,
      organization_employment,
      health_worker_id,
      employee,
      encounter,
      this_visit_findings,
    } = ctx.state

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
        assert(encounter.priority)
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
            notification_description: caseReferralNotificationDescription({
              originator_display_name: employeeDisplay(employee).display_name,
              priority_name: encounter.priority.name,
              presenting_issue: presentingIssueFromTriageFindings(this_visit_findings),
            }),
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
    this_visit_diagnoses,
    this_visit_findings,
  } = ctx.state

  const positive_records = Array.from(positiveRecordsFromEncounter({
    this_visit_diagnoses,
    this_visit_findings,
  }))

  // Dose recommendations need sex, dob, height and weight; when any are
  // missing (e.g. an emergency skipped height & weight) we route without them.
  const patient_case = PatientCaseSchema.safeParse({
    sex: patient.sex,
    dob: patient.date_of_birth,
    height_cm: patient.most_recent_height?.cm,
    weight_kg: patient.most_recent_weight?.kg,
  })

  const { reason, notes, priority } = encounter
  if (!priority) {
    return redirectToFirstIncompleteStep(ctx, { warning_message: 'Please complete triage before routing the patient' })
  }
  assert(completedPersonal(patient))

  const { clinic_employees, manage_patient_task_groups, recommended_medicine_groups } = await promiseProps({
    clinic_employees: employees_presence.getAllAtOrganization(trx, {
      organization_id,
      excluding_health_worker: {
        health_worker_id,
        at_work: true,
        seniority_order: organization_employment.seniority_order,
      },
    }),
    manage_patient_task_groups: managePatientTaskGroups(ctx),
    recommended_medicine_groups: patient_case.success
      ? recommended_dose_calculator.lookup(
        trx,
        patient_case.data,
        positive_records,
      )
      : Promise.resolve([]),
  })

  const task_groups_with_permissions = applyPermissions(organization_employment, clinic_employees, manage_patient_task_groups)
  const medicine_groups_with_permissions = applyPrescriberPermissions(organization_employment, clinic_employees, recommended_medicine_groups)
  const care_plan_groups = buildCarePlanGroups(task_groups_with_permissions, medicine_groups_with_permissions)
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
      care_plan_groups={care_plan_groups}
      triage_next_step_recommendations={triage_next_step_recommendations}
    />
  )
}

export default OpenEncounterWorkflowPage(PatientTriageRoutePatientPage)
