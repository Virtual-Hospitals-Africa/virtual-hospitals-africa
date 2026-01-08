import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import AdditionalTasks from '../../../../../../../../islands/AdditionalTasks.tsx'
import { getTasksGroups } from '../../../../../../../../db/models/additional_tasks.ts'
import { humanReadableJson } from '../../../../../../../../util/humanReadableJson.ts'
import { yes_no_unknown } from '../../../../../../../../util/validators.ts'
import { parseExpressionExpectingAtom } from '../../../../../../../../shared/s_expression.ts'
import entries from '../../../../../../../../util/entries.ts'

const TriageAdditionalTasksAndInvestigationsSchema = z.object({
  tasks: z.record(
    z.string().uuid(), // procedure_id
    z.object({
      action_status_evaluation_id: z.string().uuid(),
      done: z.boolean(),
    }),
  ).optional().default({}).transform((tasks) =>
      entries(tasks).map(([procedure_id, task]) => ({
        procedure_id,
        task,
      }))
    ),
  check_for: z.record(
    z.string().uuid(), // procedure_id
    z.object({
      s_expression: z.string().transform((
        value,
      ) => parseExpressionExpectingAtom(value, 'finding')),
      existence: yes_no_unknown
    }),
  ).optional().default({}).transform((check_for) =>
      entries(check_for).map(([procedure_id, task]) => ({
        procedure_id,
        task,
      }))
    ),
})

export const handler = postHandler(
  TriageAdditionalTasksAndInvestigationsSchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    // For now, we just proceed to the next step
    // In the future, we could store task completion status in the database
    // const { trx, encounter } = ctx.state
    console.log(humanReadableJson(form_values))

    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageAdditionalTasksAndInvestigationsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const task_groups = await getTasksGroups(ctx.state.trx, {
    health_worker_id: ctx.state.health_worker.id,
    encounter: ctx.state.encounter,
  })

  return (
    <AdditionalTasks
      task_groups={task_groups}
      organization_id={ctx.state.organization.id}
    />
  )
}

export default OpenEncounterWorkflowPage(
  TriageAdditionalTasksAndInvestigationsPage,
)
