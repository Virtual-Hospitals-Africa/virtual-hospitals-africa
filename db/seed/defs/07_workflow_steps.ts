import { WorkflowSteps } from '../../../db.d.ts'
import { WORKFLOW_STEPS, workflowStepKey } from '../../../shared/workflow.ts'
import { InsertShape } from '../../../types.ts'
import { collect } from '../../../util/collectSorted.ts'
import entries from '../../../util/entries.ts'
import { define } from '../define.ts'

function* workflowSteps(): Generator<InsertShape<WorkflowSteps>> {
  let workflow_step_order = 0
  for (const [workflow, steps] of entries(WORKFLOW_STEPS)) {
    for (const step of steps) {
      yield {
        step,
        workflow,
        workflow_step: workflowStepKey(workflow, step),
        order: ++workflow_step_order,
      }
    }
  }
}

export default define(['workflow_steps'], async (trx) => {
  await trx.insertInto('workflow_steps')
    .values(collect(workflowSteps()))
    .execute()
})
