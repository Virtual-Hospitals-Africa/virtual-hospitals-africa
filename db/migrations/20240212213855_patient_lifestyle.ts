import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'patient_lifestyle', (qb) =>
    qb
      .addColumn('patient_id', 'integer', (col) =>
        col
          .notNull()
          .references('patients.id')
          .unique()
          .onDelete('cascade'))
      .addColumn('sexual_activity', 'json')
      .addColumn('alcohol', 'json')
      .addColumn('smoking', 'json'))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_lifestyle').execute()
}
