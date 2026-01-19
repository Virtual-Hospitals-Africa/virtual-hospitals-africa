import { define } from '../define.ts'
import { WORKFLOW_SNOMED_CONCEPTS, WORKFLOWS } from '../../../shared/workflow.ts'
import entries from '../../../util/entries.ts'
import { ensureAllEnumValuesExist } from '../../helpers.ts'
import { forEach } from '../../../util/inParallel.ts'

/*
   Edit the workflows in place so that we can add new ones
   in shared/workflow.ts and run deno task db:seed load and
   have them be reflected. Faster than deno task db:rebuild
*/
export default define(['workflows'], async (trx) => {
  await ensureAllEnumValuesExist(trx, 'workflow', WORKFLOWS)

  const workflows = entries(WORKFLOW_SNOMED_CONCEPTS).map(
    ([workflow, snomed_concept], index) => ({
      workflow,
      snomed_concept_id: snomed_concept.id,
      order: index + 1,
    }),
  )

  const { count } = await trx.selectFrom('workflows').select((eb) => eb.fn.countAll().as('count'))
    .executeTakeFirstOrThrow()

  const count_int = parseInt(String(count))

  if (count_int === workflows.length) {
    return
  }

  await trx.schema.alterTable('workflows').dropConstraint(
    'workflows_order_key',
  ).execute()

  await forEach(workflows, (values) =>
    trx.insertInto('workflows')
      .values(values)
      .onConflict((oc) =>
        oc.column('workflow').doUpdateSet({
          order: values.order,
        })
      )
      .execute())

  if (count_int > workflows.length) {
    await trx.deleteFrom('workflows')
      .where((eb) => eb.not(eb.or(workflows.map((ws) => eb('workflow', '=', ws.workflow)))))
      .execute()
  }

  await trx.schema.alterTable('workflows').addUniqueConstraint(
    'workflows_order_key',
    ['order'],
  ).execute()
}, { never_dump: true, always_run: true })
