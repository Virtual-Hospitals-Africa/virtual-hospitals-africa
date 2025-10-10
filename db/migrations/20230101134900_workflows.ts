import { Kysely, sql } from 'kysely'
import {
  WORKFLOW_SNOMED_CONCEPT_IDS,
  WORKFLOW_STEPS,
  WORKFLOWS,
  workflowStepKey,
} from '../../shared/workflow.ts'
import entries from '../../util/entries.ts'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('workflow')
    .asEnum(WORKFLOWS)
    .execute()

  await db.schema.createTable('workflows')
    .addColumn('workflow', sql`workflow`, (col) => col.primaryKey())
    .addColumn('order', 'int8', (col) => col.notNull().unique())
    .addColumn('snomed_concept_id', 'bigint', (col) => col.notNull())
    .execute()

  let workflow_order = 0
  await db.insertInto('workflows')
    .values(
      entries(
        WORKFLOW_SNOMED_CONCEPT_IDS,
      ).map(
        ([workflow, snomed_concept_id]) => ({
          workflow,
          snomed_concept_id,
          order: ++workflow_order,
        }),
      ),
    )
    .execute()

  await db.schema.createTable('workflow_steps')
    .addColumn('workflow_step', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('workflow', sql`workflow`, (col) => col.notNull())
    .addColumn('step', 'varchar(255)', (col) => col.notNull())
    .addColumn('order', 'int8', (col) => col.notNull().unique())
    .addUniqueConstraint('one_step_per_workflow', [
      'workflow',
      'step',
    ])
    .execute()

  let workflow_step_order = 0
  for (const [workflow, steps] of entries(WORKFLOW_STEPS)) {
    await db.insertInto('workflow_steps')
      .values(
        steps.map((step) => ({
          workflow,
          step,
          workflow_step: workflowStepKey(workflow, step),
          order: ++workflow_step_order,
        })),
      )
      .execute()
  }
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('workflow_steps').execute()
  await db.schema.dropTable('workflows').execute()
  await db.schema.dropType('workflow').execute()
}
