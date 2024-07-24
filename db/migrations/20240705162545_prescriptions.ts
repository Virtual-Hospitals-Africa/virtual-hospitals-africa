import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'prescriptions', (qb) =>
    qb
      .addColumn(
        'alphanumeric_code',
        'varchar(255)',
        (col) => col.notNull().unique(),
      )
      .addColumn('contents', 'text', (col) => col.notNull())
      .addColumn('prescriber', 'uuid', (col) => col.notNull().references('patient_encounter_providers.id').onDelete('cascade'),)
      .addColumn('patient_id', 'uuid', (col) => col.references('patients.id').onDelete('cascade'),)
    )
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('prescriptions').execute()
}
