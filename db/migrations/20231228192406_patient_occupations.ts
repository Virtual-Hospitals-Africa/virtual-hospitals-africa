import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(
    db,
    'patient_occupations',
    (qb) =>
      qb.addColumn('patient_id', 'uuid', (col) =>
        col
          .notNull()
          .references('Patient.id')
          .onDelete('cascade'))
        .addColumn('occupation', 'json')
        .addUniqueConstraint('patient_id', ['patient_id']),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_occupations').execute()
}
