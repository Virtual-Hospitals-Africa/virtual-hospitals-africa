import { Kysely, sql } from 'kysely'
import { WORKFLOWS } from '../../shared/workflow.ts'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('workflow')
    .asEnum(WORKFLOWS)
    .execute()

  await db.schema.createTable('workflows')
    .addColumn('workflow', sql`workflow`, (col) => col.primaryKey())
    .addColumn('snomed_concept_id', 'bigint', (col) => col.notNull().unique())
    .addColumn('order', 'int8', (col) => col.notNull().unique())
    .execute()

  await db.schema.createTable('workflow_steps')
    .addColumn('workflow_step', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('workflow', sql`workflow`, (col) => col.notNull())
    .addColumn('step', 'varchar(255)', (col) => col.notNull())
    .addColumn('snomed_concept_id', 'bigint')
    .addColumn('order', 'int8', (col) => col.notNull().unique())
    .addUniqueConstraint('one_step_per_workflow', [
      'workflow',
      'step',
    ])
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('workflow_steps').execute()
  await db.schema.dropTable('workflows').execute()
  await db.schema.dropType('workflow').execute()
}
