import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'diagnoses_collaboration', (qb) =>
    qb
      .addColumn('diagnosis_id', 'uuid', (col) =>
        col.notNull().references('diagnoses.id').onDelete('cascade'))
      .addColumn('approver_id', 'uuid', (col) =>
        col.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('is_approved', 'boolean', (col) =>
        col.notNull()))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('diagnoses_collaboration').execute()
}
