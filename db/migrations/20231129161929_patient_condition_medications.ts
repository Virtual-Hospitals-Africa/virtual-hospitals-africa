import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { RegistrationFrequencies } from '../../shared/medication.ts'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createType('registration_frequency')
    .asEnum(Object.keys(RegistrationFrequencies))
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
    CREATE DOMAIN decimal_text AS text CHECK (VALUE ~ '^[0-9]+(\.[0-9]+)?$');

    CREATE TYPE medication_schedule AS (
      dosage decimal_text,
      frequency registration_frequency,
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
        'uuid',
        (col) => col.notNull().references('patient_conditions.id').onDelete('cascade'),
      )
        .addColumn(
          'medication_id',
          'uuid',
          (col) => col.references('medications.id').onDelete('cascade'),
        )
        .addColumn(
          'manufactured_medication_id',
          'uuid',
          (col) => col.references('manufactured_medications.id').onDelete('cascade'),
        )
        .addColumn('strength', 'decimal', (col) => col.notNull())
        .addColumn('route', 'varchar(255)', (col) => col.notNull())
        .addColumn('special_instructions', 'text')
        .addColumn('start_date', 'date')
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

  await db.schema
    .createIndex('idx_patient_condition_medications_medication_id')
    .on('patient_condition_medications')
    .column('medication_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_condition_medications_manufactured_medication_id')
    .on('patient_condition_medications')
    .column('manufactured_medication_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_condition_medications_start_date')
    .on('patient_condition_medications')
    .column('start_date')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_condition_medications').execute()
  await db.schema.dropType('medication_schedule').execute()
  await sql`DROP DOMAIN IF EXISTS decimal_text`.execute(db)
  await db.schema.dropType('duration_units').execute()
  await db.schema.dropType('registration_frequency').execute()
}
