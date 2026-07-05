import { z } from 'zod'
import { success } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeLastStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { preferredName } from '../../../../../../../../util/asNames.ts'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import { isManage } from '../../../../../../../../shared/tasks.ts'
import { ManagePatientGroup } from '../../../../../../../../components/triage/tasks/ManagePatientGroup.tsx'
import SectionHeader from '../../../../../../../../components/library/typography/SectionHeader.tsx'
import { NoTasks } from '../../../../../../../../components/triage/tasks/NoTasks.tsx'
import { employees } from '../../../../../../../../db/models/employees.ts'
import { employeeDisplay } from '../../../../../../../../util/healthWorkerDisplay.ts'
import { Person } from '../../../../../../../../components/library/Person.tsx'
import Badge from '../../../../../../../../components/library/Badge.tsx'
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

  const { task_groups } = await promiseProps({
    task_groups: additional_tasks.getTasksGroups(trx, { health_worker_id, encounter }).then((r) => r.task_groups),
  })

  const [referral] = await referrals.findAll(
    trx,
    {
      patient_encounter_id,
      originator_health_worker_id: health_worker_id,
    },
  )

  // TODO actually put something in the db to retrieve here
  const primary_care_nurse = await employees.findFirst(trx, { organization_id, can_perform_workflow: 'consultation' })

  const groups_with_manage_tasks = task_groups.filter((group) => group.tasks.some(isManage))

  return (
    <div class='flex flex-col gap-6'>
      <div class='flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl'>
        <SectionHeader>Primary care nurse</SectionHeader>
        {primary_care_nurse && (
          <div class='flex items-center gap-3'>
            <Person person={employeeDisplay(primary_care_nurse)} />
            <Badge content='Awaiting handoff' color='yellow' />
          </div>
        )}
      </div>
      {referral && (
        <div class='flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl'>
          <SectionHeader>Referral status</SectionHeader>
          <ReferralRecipients
            referral_id={referral.id}
            recipients={referral.recipients}
          />
        </div>
      )}
      {groups_with_manage_tasks.length > 0
        ? (
          <div class='flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl'>
            <SectionHeader>Patient Management Tasks</SectionHeader>
            {groups_with_manage_tasks.map((group, index) => (
              <ManagePatientGroup
                key={index}
                group={group}
                organization_employment={organization_employment}
                organization_id={organization_id}
                primary_care_nurse={primary_care_nurse}
              />
            ))}
          </div>
        )
        : <NoTasks />}
    </div>
  )
}

export default OpenEncounterWorkflowPage(CheckWithColleagueAwaitOrdersPage)
