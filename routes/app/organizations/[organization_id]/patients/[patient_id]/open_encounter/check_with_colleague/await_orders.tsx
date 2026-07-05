import { z } from 'zod'
import { success } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeLastStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { preferredName } from '../../../../../../../../util/asNames.ts'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import SectionHeader from '../../../../../../../../components/library/typography/SectionHeader.tsx'
import { NoTasks } from '../../../../../../../../components/triage/tasks/NoTasks.tsx'
import { employees } from '../../../../../../../../db/models/employees.ts'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'
import { applyPermissions } from '../../../../../../../../shared/permissions.ts'
import RecommendedCarePlan from '../../../../../../../../components/library/RecommendedCarePlan.tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { patient_workflows } from '../../../../../../../../db/models/patient_workflows.ts'
import { referrals } from '../../../../../../../../db/models/referrals.ts'
import { ReferralRecipients } from '../../../../../../../../islands/referral/ReferralRecipients.tsx'

const CheckWithColleagueAwaitOrdersSchema = z.object({})

export const handler = postHandler(
  CheckWithColleagueAwaitOrdersSchema,
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    const { trx, encounter, organization_id, organization_pathname, organization_employment, patient, patient_id, patient_encounter_id } = ctx.state
    await completeLastStep(ctx)
    // TODO actually put something in the db to retrieve here
    const primary_care_nurse = await employees.findFirst(trx, { organization_id, can_perform_workflow: 'consultation' })
    const patient_workflow_id = await patient_workflows.insertOne(trx, {
      patient_encounter_id,
      workflow: 'consultation',
    })

    await patient_workflows.start(
      trx,
      {
        encounter,
        patient_workflow_id,
        employment_id: primary_care_nurse.employee_id,
        existing_patient_encounter_employee_id: null,
      },
    )
    await trx.updateTable('patient_presence')
      .set({
        current_workflow: 'consultation',
        next_workflow: null,
        department_name: 'Primary care',
      })
      .where('id', '=', patient_id)
      .execute()

    await trx.updateTable('employment_presence')
      .set({ with_patient_id: null })
      .where('id', '=', organization_employment.employment_id)
      .execute()

    await trx.updateTable('employment_presence')
      .set({
        with_patient_id: patient_id,
      })
      .where('id', '=', primary_care_nurse.employee_id)
      .execute()

    return redirect(
      success(
        `Referral completed for ${preferredName(patient.names!, 'patient')}.`,
        `${organization_pathname}/waiting_room`,
      ),
    )
  },
)

async function CheckWithColleagueAwaitOrdersPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, health_worker_id, encounter, organization_employment, organization_id, patient_encounter_id } = ctx.state

  const { task_groups, clinic_employees } = await promiseProps({
    task_groups: additional_tasks.getTasksGroups(trx, { health_worker_id, encounter }).then((r) => r.task_groups),
    clinic_employees: employees_presence.getAllAtOrganization(trx, {
      organization_id,
      excluding_health_worker: {
        health_worker_id,
        at_work: true,
        seniority_order: organization_employment.seniority_order,
      },
    }),
  })

  const [referral] = await referrals.findAll(
    trx,
    {
      patient_encounter_id,
      originator_health_worker_id: health_worker_id,
    },
  )

  const task_groups_with_permissions = applyPermissions(organization_employment, clinic_employees, task_groups)

  // Highlight the colleagues we're awaiting orders from.
  const referral_recipient_health_worker_ids = new Set(
    (referral?.recipients ?? []).map((recipient) => recipient.health_worker.id),
  )
  const to_be_notified = clinic_employees.filter((employee) => referral_recipient_health_worker_ids.has(employee.id))

  return (
    <div class='flex flex-col gap-6'>
      {referral && (
        <div class='flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl'>
          <SectionHeader>Referral status</SectionHeader>
          <ReferralRecipients
            referral_id={referral.id}
            recipients={referral.recipients}
          />
        </div>
      )}
      {task_groups_with_permissions.length > 0
        ? (
          <div class='flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl'>
            <SectionHeader>Patient Management Tasks</SectionHeader>
            <RecommendedCarePlan
              to_be_notified={to_be_notified}
              task_groups_with_permissions={task_groups_with_permissions}
              organization_id={organization_id}
            />
          </div>
        )
        : <NoTasks />}
    </div>
  )
}

export default OpenEncounterWorkflowPage(CheckWithColleagueAwaitOrdersPage)
