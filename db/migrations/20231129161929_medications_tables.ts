import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import { IntakeFrequencies } from '../models/patient_conditions.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('drugs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('generic_name', 'varchar(255)', (col) => col.notNull())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint('drugs_generic_name_unique', ['generic_name'])
    .execute()

  await db.schema
    .createTable('medications')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'drug_id',
      'integer',
      (col) => col.notNull().references('drugs.id').onDelete('cascade'),
    )
    .addColumn('form', 'varchar(255)', (col) => col.notNull())
    .addColumn('routes', sql`varchar(255)[]`, (col) => col.notNull())
    .addColumn(
      'strength_numerators',
      sql`real[]`,
      (col) => col.notNull(),
    )
    .addColumn(
      'strength_numerator_unit',
      'varchar(255)',
      (col) => col.notNull(),
    )
    .addColumn('strength_denominator', 'numeric', (col) => col.notNull())
    .addColumn(
      'strength_denominator_unit',
      'varchar(255)',
      (col) => col.notNull(),
    )
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addCheckConstraint(
      'at_least_one_strength_check',
      sql`array_length(strength_numerators, 1) >= 1`,
    )
    .addCheckConstraint(
      'at_least_one_route_check',
      sql`array_length(routes, 1) >= 1`,
    )
    .execute()

  await sql`
    ALTER TABLE medications
    ADD form_route TEXT NOT NULL
    GENERATED ALWAYS AS (
      form || (
        CASE WHEN array_length(routes, 1) = 1 
          THEN '; ' || routes[1]
          ELSE ''
        END
      )
    ) STORED
  `.execute(db)

  await sql`
    ALTER TABLE medications
    ADD strength_denominator_is_units BOOLEAN NOT NULL
    GENERATED ALWAYS AS (
      strength_denominator_unit IN ('MG', 'G', 'ML', 'L', 'MCG', 'UG', 'IU')
    )
    STORED
  `.execute(db)

  await db.schema
    .createTable('manufactured_medications')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('trade_name', 'varchar(1024)', (col) => col.notNull())
    .addColumn('applicant_name', 'varchar(1024)', (col) => col.notNull())
    .addColumn('manufacturer_name', 'varchar(2048)', (col) => col.notNull())
    .addColumn(
      'strength_numerators',
      sql`real[]`,
      (col) => col.notNull(),
    )
    .addColumn(
      'medication_id',
      'integer',
      (col) => col.notNull().references('medications.id').onDelete('cascade'),
    )
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .execute()

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

  await db.schema
    .createTable('patient_condition_medications')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
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
    .execute()

  await addUpdatedAtTrigger(db, 'drugs')
  await addUpdatedAtTrigger(db, 'medications')
  await addUpdatedAtTrigger(db, 'manufactured_medications')
  await addUpdatedAtTrigger(db, 'patient_condition_medications')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_condition_medications').execute()
  await db.schema.dropTable('manufactured_medications').execute()
  await db.schema.dropTable('medications').execute()
  await db.schema.dropTable('drugs').execute()
  await db.schema.dropType('medication_schedule').execute()
  await db.schema.dropType('duration_units').execute()
  await db.schema.dropType('intake_frequency').execute()
}
