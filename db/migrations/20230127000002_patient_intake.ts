import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'patient_intake',
    (qb) =>
      qb.addColumn('patient_id', 'uuid', (col) =>
        col.notNull().unique()
          .references('patients.id')
          .onDelete('cascade'))
        .addColumn('organization_id', 'uuid', (col) =>
          col.notNull()
            .references('organizations.id')
            .onDelete('cascade'))
        .addColumn('being_taken_by', 'uuid', (col) =>
          col.notNull()
            .references('employment.id')
            .onDelete('cascade')),
  )

  await createStandardTable(
    db,
    'patient_intake_visit_reason',
    (qb) =>
      qb.addColumn('patient_intake_id', 'uuid', (col) =>
        col.notNull()
          .unique()
          .references('patient_intake.id')
          .onDelete('cascade'))
        .addColumn('reason', sql`encounter_reason`, (col) => col.notNull())
        .addColumn('emergency', 'boolean', (col) =>
          col.notNull().defaultTo(false))
        .addColumn('department_id', 'uuid', (col) =>
          col.notNull()
            .references('organization_departments.id')
            .onDelete('cascade'))
        .addColumn('notes', 'text'),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_intake_steps').execute()
  await db.schema.dropTable('patient_intake').execute()
}
