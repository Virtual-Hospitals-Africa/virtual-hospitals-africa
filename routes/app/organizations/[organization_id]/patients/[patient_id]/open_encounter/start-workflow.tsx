import { z } from 'zod'
import { assertOr400, assertOr403 } from '../../../../../../../util/assertOr.ts'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { OpenEncounterContext } from './_middleware.tsx'
import {
  Workflow,
  WORKFLOW_STEPS,
} from '../../../../../../../shared/workflow.ts'
import * as patient_workflows from '../../../../../../../db/models/patient_workflows.ts'
import { WORKFLOW_DEPARTMENTS } from '../../../../../../../shared/departments.ts'
import { arrayIsEmpty } from '../../../../../../../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'
import * as patient_presence from '../../../../../../../db/models/patient_presence.ts'
import { UpdateShape } from '../../../../../../../types.ts'
import { DB } from '../../../../../../../db.d.ts'

const StartWorkflowSchema = z.object({
  workflow: z.enum([
    'registration' as const,
    'triage' as const,
    'consultation' as const,
    'maternity' as const,
    'prescription_refill' as const,
    'doctor_review' as const,
  ]),
})

export async function startWorkflow<T>(
  ctx: OpenEncounterContext<T>,
  workflow: Workflow,
) {
  console.log('kk startWorkflow')
  const { trx, organization_employment, encounter } = ctx.state

  const department_handling_workflow = WORKFLOW_DEPARTMENTS[workflow]

  const employed_in_department_handling_workflow = organization_employment
    .departments.find(
      (department) => department.name === department_handling_workflow,
    )

  assertOr403(
    employed_in_department_handling_workflow,
    `You must be employed in the ${department_handling_workflow} department to start ${workflow}`,
  )

  const workflow_status = encounter.workflows[workflow]
  assertOr400(workflow_status, `${workflow} workflow not planned`)

  assertOr400(
    workflow_status.status !== 'completed',
    `${workflow} workflow already completed`,
  )

  const { employment_id } = organization_employment

  const existing_patient_encounter_employee_id =
    encounter.all_employees_seen.find(
      (employee) => employee.employee_id === employment_id,
    )?.patient_encounter_employee_id || null

  console.log('mwkelwke')
  await patient_workflows.start(
    trx,
    {
      encounter,
      employment_id,
      existing_patient_encounter_employee_id,
      patient_workflow_id: workflow_status.patient_workflow_id,
    },
  )

  const patient_presence_updates: UpdateShape<DB['patient_presence']> = {
    current_workflow: workflow,
    department_name: employed_in_department_handling_workflow.name,
    next_workflow: null,
  }
  await patient_presence.set(
    ctx.state.trx,
    encounter.patient.id,
    patient_presence_updates,
  )

  const first_incomplete_step = WORKFLOW_STEPS[workflow].find((s) => {
    if (arrayIsEmpty(workflow_status.steps_completed)) return true
    return !workflow_status.steps_completed.includes(s)
  })
  assert(
    first_incomplete_step,
    'There must be some incomplete step if the workflow is not completed',
  )

  return redirect(replaceParams(
    `/app/organizations/:organization_id/patients/:patient_id/open_encounter/${workflow}/${first_incomplete_step}`,
    ctx.params,
  ))
}

export const handler = postHandler(
  StartWorkflowSchema,
  (ctx: OpenEncounterContext, { workflow }) => startWorkflow(ctx, workflow),
)
