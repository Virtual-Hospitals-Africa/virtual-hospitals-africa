import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('drugs')
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
    .addColumn('generic_name', 'varchar(255)', (col) => col.notNull().unique())
    .execute()

  await db.schema
    .createTable('medications')
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
    .execute()

  await addUpdatedAtTrigger(db, 'drugs')
  await addUpdatedAtTrigger(db, 'medications')
  await addUpdatedAtTrigger(db, 'manufactured_medications')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('manufactured_medications').execute()
  await db.schema.dropTable('medications').execute()
  await db.schema.dropTable('drugs').execute()
}
