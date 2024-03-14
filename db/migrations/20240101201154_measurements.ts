import { Kysely } from 'kysely'
import { MEASUREMENTS } from '../../shared/measurements.ts'
import { createStandardTable } from '../createStandardTable.ts'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('measurements')
    .addColumn('name', 'varchar(40)', (col) => col.primaryKey())
    .addColumn('units', 'varchar(10)', (col) => col.notNull())
    .execute()

  await db.insertInto('measurements')
    .values(
      Object.entries(MEASUREMENTS).map(([name, units]) => ({
        name,
        units,
      })),
    )
    .execute()

  await createStandardTable(db, 'patient_measurements', (qb) =>
    qb.addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
      .addColumn(
        'encounter_id',
        'integer',
        (col) =>
          col.notNull().references('patient_encounters.id').onDelete('cascade'),
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
        'measurement_name',
        'varchar(40)',
        (col) =>
          col.notNull().references('measurements.name').onDelete('cascade'),
      )
      .addColumn('value', 'numeric', (col) => col.notNull())
      .addUniqueConstraint('one_measurement_per_encounter', [
        'patient_id',
        'encounter_id',
        'measurement_name',
      ]))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_measurements').execute()
  await db.schema.dropTable('measurements').execute()
}
