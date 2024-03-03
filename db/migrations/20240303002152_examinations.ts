import { Kysely } from 'kysely'
import { EXAMINATIONS } from '../../shared/examinations.ts'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(
  db: Kysely<{
    examinations: unknown
  }>,
) {
  await db.schema.createTable('examinations')
    .addColumn('name', 'varchar(40)', (col) => col.primaryKey())
    .execute()

  await db.insertInto('examinations').values(
    EXAMINATIONS.map((name) => ({ name })),
  ).execute()

  await createStandardTable(
    db,
    'patient_examinations',
    (table) =>
      table.addColumn(
        'patient_id',
        'integer',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
        .addColumn(
          'encounter_id',
          'integer',
          (col) =>
            col.notNull().references('patient_encounters.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'encounter_provider_id',
          'integer',
          (col) =>
            col.notNull().references('patient_encounter_providers.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'examination_name',
          'varchar(40)',
          (col) =>
            col.notNull().references('examinations.name').onDelete('cascade'),
        )
        .addColumn(
          'completed',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        )
        .addColumn(
          'skipped',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_examinations').execute()
  await db.schema.dropTable('examinations').execute()
}
