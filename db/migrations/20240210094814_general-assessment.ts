//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import parseJSON from '../../util/parseJSON.ts'
import uniq from '../../util/uniq.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('general_assessment_categories')
    .addColumn('category', 'varchar(255)', (col) => col.primaryKey().notNull())
    .addColumn('order', 'integer', (col) => col.notNull().unique())
    .execute()

  await db.schema
    .createTable('general_assessments')
    .addColumn('assessment', 'varchar(255)', (col) => col.primaryKey())
    .addColumn(
      'category',
      'varchar(255)',
      (col) =>
        col.notNull().references('general_assessment_categories.category')
          .onDelete('cascade'),
    )
    .execute()

  await db.schema
    .createTable('patient_general_assessments')
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
      'assessment',
      'varchar(255)',
      (col) =>
        col.notNull().references('general_assessments.assessment').onDelete(
          'cascade',
        ),
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
    .addUniqueConstraint('patient_general_assessment_unique', [
      'assessment',
      'encounter_id',
    ])
    .execute()

  await addUpdatedAtTrigger(db, 'patient_general_assessments')
  await seedDataFromJSON(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_general_assessments').execute()
  await db.schema.dropTable('general_assessments').execute()
  await db.schema.dropTable('general_assessment_categories').execute()
}

async function seedDataFromJSON(db: Kysely<any>) {
  const data: { assessment: string; category: string }[] = await parseJSON(
    './db/resources/general_assessments.json',
  )
  const categories = uniq(data.map((d) => d.category)).map((
    category,
    index,
  ) => ({ category, order: index + 1 }))

  await db
    .insertInto('general_assessment_categories')
    .values(categories)
    .execute()

  await db
    .insertInto('general_assessments')
    .values(data)
    .execute()
}
