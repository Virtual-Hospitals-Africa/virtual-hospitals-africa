import { InsertObject } from 'kysely'
import { DB } from '../../../db.d.ts'
import { WORKFLOW_STEPS, workflowStepKey, workflowStepSnomedConcept } from '../../../shared/workflow.ts'

import { collect } from '../../../util/collectSorted.ts'
import entries from '../../../util/entries.ts'
import { forEach } from '../../../util/inParallel.ts'
import { define } from '../define.ts'

function* workflowSteps(): Generator<InsertObject<DB, 'workflow_steps'>> {
  let workflow_step_order = 0
  for (const [workflow, steps] of entries(WORKFLOW_STEPS)) {
    for (const step of steps) {
      yield {
        step,
        workflow,
        workflow_step: workflowStepKey(workflow, step),
        snomed_concept_id: workflowStepSnomedConcept(workflow, step)?.id,
        order: ++workflow_step_order,
      }
    }
  }
}

/*
   Edit the workflow_steps in place so that we can add new ones
   in shared/workflow.ts and run deno task db:seed load and
   have them be reflected. Faster than deno task db:rebuild
*/
export default define(['workflow_steps'], async (trx) => {
  const workflow_steps = collect(workflowSteps())
  const { count } = await trx.selectFrom('workflow_steps').select((eb) => eb.fn.countAll().as('count'))
    .executeTakeFirstOrThrow()

  const count_int = parseInt(String(count))

  if (count_int === workflow_steps.length) {
    return
  }

  await trx.schema.alterTable('workflow_steps').dropConstraint(
    'workflow_steps_order_key',
  ).execute()

  await forEach(workflow_steps, (values) =>
    trx.insertInto('workflow_steps')
      .values(values)
      .onConflict((oc) =>
        oc.constraint('one_step_per_workflow').doUpdateSet({
          order: values.order,
        })
      )
      .execute())

  if (count_int > workflow_steps.length) {
    await trx.deleteFrom('workflow_steps')
      .where((eb) =>
        eb.not(eb.or(workflow_steps.map((ws) =>
          eb.and([
            eb('step', '=', ws.step),
            eb('workflow', '=', ws.workflow),
          ])
        )))
      )
      .execute()
  }

  await trx.schema.alterTable('workflow_steps').addUniqueConstraint(
    'workflow_steps_order_key',
    ['order'],
  ).execute()
}, { always_run: true })
