import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import { MEASUREMENTS } from '../models/patient_measurements.ts'

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

  await db.schema
    .createTable('patient_measurements')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
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
    ])
    .execute()

  return addUpdatedAtTrigger(db, 'patient_measurements')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_measurements').execute()
  await db.schema.dropTable('measurements').execute()
}
