import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createStandardTable(db, 'patient_lifestyle', (qb) =>
    qb
      .addColumn('patient_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patients.id')
          .unique()
          .onDelete('cascade'))
      .addColumn('sexual_activity', 'json')
      .addColumn('alcohol', 'json')
      .addColumn('smoking', 'json')
      .addColumn('substance_use', 'json')
      .addColumn('exercise', 'json')
      .addColumn('diet', 'json'))
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_lifestyle').execute()
}
