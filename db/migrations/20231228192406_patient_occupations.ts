import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createStandardTable(
    db,
    'patient_occupations',
    (qb) =>
      qb.addColumn('patient_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patients.id')
          .onDelete('cascade'))
        .addColumn('occupation', 'json')
        .addUniqueConstraint('patient_id', ['patient_id']),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_occupations').execute()
}
