import { z } from 'zod'
import { assertOr400, assertOr403 } from '../../../../../../../util/assertOr.ts'
import { postHandler } from '../../../../../../../util/postHandler.ts'
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
import { assert } from 'node:console'

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
  const { trx, organization_employment, encounter } = ctx.state

  const department_handling_workflow = WORKFLOW_DEPARTMENTS[workflow]

  const employed_in_department_handling_workflow = organization_employment
    .departments.some(
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

  const seeing_as_employment_id = organization_employment.employment_id
  assertOr403(
    seeing_as_employment_id,
    'Must be seeing the patient in the context of a non-admin profession',
  )

  const existing_patient_encounter_employee_id =
    encounter.all_employees_seen.find(
      (employee) => employee.employee_id === seeing_as_employment_id,
    )?.patient_encounter_employee_id || null

  const do_start_workflow = workflow_status.status === 'not started' ||
    (existing_patient_encounter_employee_id !== null &&
      !workflow_status.seen_patient_encounter_employee_ids.includes(
        existing_patient_encounter_employee_id,
      ))
  if (do_start_workflow) {
    await patient_workflows.start(
      trx,
      {
        encounter,
        existing_patient_encounter_employee_id,
        seeing_as_employment_id,
        workflow_status,
      },
    )
  }

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
