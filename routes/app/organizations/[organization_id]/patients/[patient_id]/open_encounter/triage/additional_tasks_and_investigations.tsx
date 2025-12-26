import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import AdditionalTasks from '../../../../../../../../islands/AdditionalTasks.tsx'
import { getTasksGroups } from '../../../../../../../../db/models/additional_tasks.ts'

const TriageAdditionalTasksAndInvestigationsSchema = z.object({
  tasks: z.record(
    z.string().uuid(), // procedure_id
    z.object({
      action_status_evaluation_id: z.string().uuid(),
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
  const task_groups = await getTasksGroups(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    health_worker_id: ctx.state.health_worker.id,
    encounter: ctx.state.encounter,
  })

  return <AdditionalTasks task_groups={task_groups} />
}

export default OpenEncounterWorkflowPage(
  TriageAdditionalTasksAndInvestigationsPage,
)
