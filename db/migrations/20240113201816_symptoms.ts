import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import { SYMPTOMS } from '../../shared/symptoms.ts'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('symptoms')
    .addColumn('symptom', 'varchar(40)', (col) => col.primaryKey())
    .addColumn('category', 'varchar(40)', (col) => col.notNull())
    .addColumn('aliases', sql`varchar(40)[]`, (col) => col.notNull())
    .execute()

  await db.insertInto('symptoms').values(SYMPTOMS).execute()

  await db.schema
    .createTable('patient_symptoms')
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
      'symptom',
      'varchar(40)',
      (col) => col.notNull().references('symptoms.symptom').onDelete('cascade'),
    )
    .addColumn(
      'severity',
      'int4',
      (col) => col.notNull().check(sql`severity > 0 AND severity <= 10`),
    )
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date')
    .addColumn('site', 'varchar(255)')
    .addColumn('notes', 'text')
    .addCheckConstraint(
      'symptom_date_range',
      sql`
      end_date IS NULL OR end_date >= start_date
    `,
    )
    .execute()

  await db.schema.createTable('patient_symptom_media')
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
      'patient_symptom_id',
      'integer',
      (col) =>
        col.notNull().references('patient_symptoms.id').onDelete('cascade'),
    )
    .addColumn(
      'media_id',
      'integer',
      (col) => col.notNull().references('media.id').onDelete('cascade'),
    )
    .execute()

  await addUpdatedAtTrigger(db, 'patient_symptoms')
  await addUpdatedAtTrigger(db, 'patient_symptom_media')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_symptom_media').execute()
  await db.schema.dropTable('patient_symptoms').execute()
  await db.schema.dropTable('symptoms').execute()
}
