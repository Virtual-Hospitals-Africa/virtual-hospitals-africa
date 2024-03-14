import { Kysely, sql } from 'kysely'
import { IntakeFrequencies } from '../../shared/medication.ts'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('intake_frequency')
    .asEnum(Object.keys(IntakeFrequencies))
    .execute()

  await db.schema
    .createType('duration_units')
    .asEnum([
      'days',
      'weeks',
      'months',
      'years',
      'indefinitely',
    ])
    .execute()

  await sql`
    CREATE TYPE medication_schedule AS (
      dosage numeric,
      frequency intake_frequency,
      duration integer,
      duration_unit duration_units
    )
  `.execute(db)

  await createStandardTable(
    db,
    'patient_condition_medications',
    (qb) =>
      qb.addColumn(
        'patient_condition_id',
        'integer',
        (col) =>
          col.notNull().references('patient_conditions.id').onDelete('cascade'),
      )
        .addColumn(
          'medication_id',
          'integer',
          (col) => col.references('medications.id').onDelete('cascade'),
        )
        .addColumn(
          'manufactured_medication_id',
          'integer',
          (col) =>
            col.references('manufactured_medications.id').onDelete('cascade'),
        )
        .addColumn('strength', 'numeric', (col) => col.notNull())
        .addColumn('route', 'varchar(255)', (col) => col.notNull())
        .addColumn('special_instructions', 'text')
        .addColumn('start_date', 'date', (col) => col.notNull())
        .addColumn('schedules', sql`medication_schedule[]`)
        .addCheckConstraint(
          'patient_condition_medications_med_id_check',
          sql`
        (manufactured_medication_id IS NOT NULL AND medication_id IS NULL) OR
        (medication_id IS NOT NULL AND manufactured_medication_id IS NULL)
      `,
        )
        .addCheckConstraint('schedules_check', sql`cardinality(schedules) > 0`)
        .addUniqueConstraint('patient_condition_medication_unique', [
          'patient_condition_id',
          'medication_id',
          'manufactured_medication_id',
          'start_date',
        ], (constraint) => constraint.nullsNotDistinct()),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_condition_medications').execute()
  await db.schema.dropType('medication_schedule').execute()
  await db.schema.dropType('duration_units').execute()
  await db.schema.dropType('intake_frequency').execute()
}
