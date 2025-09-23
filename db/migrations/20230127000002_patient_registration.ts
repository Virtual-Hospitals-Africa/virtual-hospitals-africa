import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'patient_registration',
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
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_registration').execute()
}
