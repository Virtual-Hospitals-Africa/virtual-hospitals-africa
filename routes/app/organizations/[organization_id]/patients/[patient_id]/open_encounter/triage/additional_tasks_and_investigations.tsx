import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import AdditionalTasks from '../../../../../../../../islands/AdditionalTasks.tsx'
import {
  KEYED_ADDITIONAL_TASK_GROUPS,
  KeyedTriggeredTaskGroup,
} from '../../../../../../../../shared/additional_tasks.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'
import compact from '../../../../../../../../util/compact.ts'

const TriageAdditionalTasksAndInvestigationsSchema = z.object({
  tasks: z.record(
    z.uuid(), // procedure_id
    z.object({
      action_status_evaluation_id: z.uuid(),
      done: z.boolean(),
    }),
  ).optional().default({}),
})

export const handler = postHandler(
  TriageAdditionalTasksAndInvestigationsSchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    // For now, we just proceed to the next step
    // In the future, we could store task completion status in the database
    // const { trx, encounter } = ctx.state

    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageAdditionalTasksAndInvestigationsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, patient } = ctx.state
  const patient_id = patient.id

  // Filter task groups based on trigger_s_expression
  const filtered_task_groups = await Promise.all(
    KEYED_ADDITIONAL_TASK_GROUPS.map(async (group) => {
      const trigger_result = await satisfyingSExpression(trx, {
        patient_id,
        s_expression: group.trigger_s_expression,
      })

      if (!trigger_result.satisfies) {
        return null
      }

      return group
    }),
  )

  const active_task_groups: KeyedTriggeredTaskGroup[] = compact(
    filtered_task_groups,
  )

  // TODO: In the future, fetch task completion status from database
  // For now, all tasks start as incomplete
  const task_completions: {
    group_key: string
    task_key: string
    completed: boolean
  }[] = []

  return (
    <AdditionalTasks
      active_task_groups={active_task_groups}
      task_completions={task_completions}
    />
  )
}

export default OpenEncounterWorkflowPage(
  TriageAdditionalTasksAndInvestigationsPage,
)
